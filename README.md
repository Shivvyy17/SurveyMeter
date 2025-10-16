# 📊 SurveyMeter

A lightweight React + Vite web app to create and respond to MCQ-based surveys with live results in chart form.

```bash
curl -X POST https://surveymeter-backend.vercel.app/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "name": "qAdmin",
    "email": "admin@surveymeter.com",
    "password": "admin123"
  }'
```