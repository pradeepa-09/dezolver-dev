import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CollegesModule } from './modules/colleges/colleges.module';
import { PlansModule } from './modules/plans/plans.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    CollegesModule,
    PlansModule,
    SubscriptionsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
