/* eslint-disable no-void */
import 'dotenv/config';
import 'reflect-metadata';
import { SlackBotApp } from './SlackBotApp';
import container from './dic';
import { HealthCheckServer } from './interfaces/HealthCheckServer';

void container.get(HealthCheckServer).start();
void container.get(SlackBotApp).start();
