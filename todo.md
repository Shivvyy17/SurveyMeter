- add option to go to Homepage from all pages
- if delete a user, then delete all surveys created by them
- change email to username everywhere
- add option to change password for admin
- allow admin to edit teachers info, view their surveys
- allow teachers to change their info, including password
- ask how to give this app to someone else to use

```bash
curl -X POST https://surveymeter-backend.vercel.app/api/admin/init \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@surveymeter.com",
    "password": "admin123"
  }'
```