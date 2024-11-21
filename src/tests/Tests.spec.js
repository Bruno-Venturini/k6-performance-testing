import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

export const getContactsDuration = new Trend('get_contacts', true);

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.3'],
    http_req_duration: ['avg<10000']
  },
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 15 },
    { duration: '30s', target: 25 },
    { duration: '60s', target: 50 },
    { duration: '20s', target: 25 },
    { duration: '10s', target: 10 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data)
  };
}

export default function () {
  const baseUrl =
    'https://api.ajfans.alphacode.com.br/api/categoriafilme/?shopping_id=1388&data=21/11';
  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);

  getContactsDuration.add(res.timings.duration);

  check(res, {
    'get filmes nacoes - status 200': () => res.status === OK
  });
}
