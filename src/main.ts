import 'dotenv/config';
import 'reflect-metadata';
import { SlackBotApp } from './SlackBotApp';
import container from './dic';

void container.get(SlackBotApp).start();
