#!/bin/bash

# Generates a new secure local .env file
echo "Rotating secrets for local environment..."

# Generate a 256-bit secure hex string for the JWT Secret
NEW_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NEW_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

cat <<EOF > .env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/shopease
JWT_SECRET=${NEW_SECRET}
JWT_REFRESH_SECRET=${NEW_REFRESH_SECRET}
CLIENT_URL=http://localhost:5173
EOF

echo "Done! The server/.env file has been recreated with local development defaults and new secure JWT secrets."
echo "CRITICAL: If your previous MONGO_URI contained production credentials (e.g., Atlas), you MUST change that password in the MongoDB Atlas dashboard immediately!"
