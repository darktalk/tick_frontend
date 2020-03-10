#! /bin/zsh
cd /Users/lintong/Documents/src/tick_frontend
npm run build
sshpass -p Lintong492610 scp -r dist root@47.115.122.37:/root/
sshpass -p Lintong492610 ssh root@47.115.122.37  'rm -rf /root/tick/dist && mv /root/dist /root/tick/dist && nginx -s reload'

cd /Users/lintong/Documents/src/tick_backend
mvn package && chmod +x /Users/lintong/Documents/src/tick_backend/target/tick_backend-1.0-SNAPSHOT.jar &&  sshpass -p Lintong492610 scp /Users/lintong/Documents/src/tick_backend/target/tick_backend-1.0-SNAPSHOT.jar  root@47.115.122.37:/root/tick_backend-1.0-SNAPSHOT.jar

sshpass -p Lintong492610 ssh root@47.115.122.37  "kill -9 \$(ps aux | grep tick_backend-1.0-SNAPSHOT.jar | grep -v grep | awk '{print \$2}'); cd /root && java -jar tick_backend-1.0-SNAPSHOT.jar"
