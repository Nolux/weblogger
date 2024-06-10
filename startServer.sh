#!/bin/sh
echo sleeping 5 sec
sleep 5
echo doing prisma db push
npx prisma db push && node addAdminUser.js && npm run server
