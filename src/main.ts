import 'dotenv/config';
import 'reflect-metadata';
import { SlackBotApp } from './SlackBotApp';
import container from './dic';

// eslint-disable-next-line no-void
void container.get(SlackBotApp).start();
