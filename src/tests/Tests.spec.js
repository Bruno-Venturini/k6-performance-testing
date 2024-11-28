import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const durationTrendMetric = new Trend('call_duration_trend', true);
export const statusRateMetric = new Rate('succesful_calls_rate');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    http_req_duration: ['p(95)<5700']
  },
  stages: [
    { duration: '20s', target: 10 },
    { duration: '20s', target: 60 },
    { duration: '60s', target: 60 },
    { duration: '20s', target: 120 },
    { duration: '60s', target: 120 },
    { duration: '20s', target: 200 },
    { duration: '60s', target: 200 },
    { duration: '20s', target: 300 },
    { duration: '20s', target: 300 }
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
  const res = http.get(`${baseUrl}`, params);
  const isRequestSuccessful = res.status >= 200 && res.status < 300;

  statusRateMetric.add(isRequestSuccessful);
  durationTrendMetric.add(res.timings.duration);
}
