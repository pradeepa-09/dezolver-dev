import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly cls: ClsService) {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({ adapter });

    // Note: To keep typings of PrismaService, we use a known NestJS trick of returning $extends from the constructor.
    return this.$extends({
      query: {
        $allModels: {
          $allOperations: async ({ model, operation, args, query }) => {
            const role = cls.get<string | undefined>('role');
            const collegeId = cls.get<string | undefined>('collegeId');

            // If we are in an authenticated context, set PostgreSQL session variables for RLS
            // We use a sequential transaction to ensure set_config and the query run on the same connection.
            if (role && model && operation) {
              return this.$transaction(
                async (
                  tx: Omit<
                    PrismaClient,
                    | '$connect'
                    | '$disconnect'
                    | '$on'
                    | '$transaction'
                    | '$use'
                    | '$extends'
                  >,
                ) => {
                  await tx.$executeRawUnsafe(`SET LOCAL ROLE tenant_app`);
                  await tx.$executeRawUnsafe(
                    `SELECT set_config('app.current_role', $1, true)`,
                    role,
                  );
                  if (collegeId) {
                    await tx.$executeRawUnsafe(
                      `SELECT set_config('app.current_college_id', $1, true)`,
                      collegeId,
                    );
                  } else {
                    await tx.$executeRawUnsafe(
                      `SELECT set_config('app.current_college_id', '', true)`,
                    );
                  }

                  const txRecord = tx as unknown as Record<
                    string,
                    Record<string, (a: unknown) => Promise<unknown>>
                  >;

                  const modelDelegate = txRecord[model];

                  if (
                    modelDelegate &&
                    typeof modelDelegate[operation] === 'function'
                  ) {
                    return modelDelegate[operation](args);
                  }

                  // Fallback (should not happen for normal models)
                  return query(args);
                },
              );
            }

            // No role means no auth context (e.g., initial login lookup), run normally (will be subject to RLS bypass rules)
            return query(args);
          },
        },
      },
    }) as this;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
