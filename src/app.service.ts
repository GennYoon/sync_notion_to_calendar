import * as ics from 'ics';
import dayjs from 'dayjs';
import { Client } from '@notionhq/client/build/src';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private config: ConfigService) {}

  async getCalendar(): Promise<any> {
    const notionSecretKey = this.config.get('NOTION_SECRET_KEY');
    const notionDatabaseId = this.config.get('NOTION_DATABASE_ID');

    try {
      const notion = new Client({ auth: notionSecretKey });

      const response = await notion.databases.query({
        database_id: notionDatabaseId,
      });

      const events = response.results.map<any>(({ properties }: any) => {
        const { 이름, 날짜 } = properties;
        const { start, end } = 날짜['date'];

        let startData = [
          Number(dayjs(start).format('YYYY')),
          Number(dayjs(start).format('MM')),
          Number(dayjs(start).format('DD')),
        ];

        if (end && !/\d{4}-\d{2}-\d{2}$/.test(end)) {
          startData = [
            ...startData,
            Number(dayjs(start).format('HH')),
            Number(dayjs(start).format('mm')),
          ];
        }

        const result = {
          title: 이름['title'][0].text.content,
          start: startData,
        };

        if (end) {
          const date = Number(dayjs(end).diff(dayjs(start), 'minutes'));
          let days = Math.floor(date / (60 * 24));
          if (days > 0) days += 1;
          result['duration'] = { days };

          if (!/\d{4}-\d{2}-\d{2}$/.test(end)) {
            const remainingDays = date % (60 * 24);
            const hours = remainingDays / 60;
            const minutes = remainingDays % 60;
            result['duration'].hours = hours;
            result['duration'].minutes = minutes;
          }
        }

        return result;
      });

      const { value } = ics.createEvents(events);

      return value;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
}
