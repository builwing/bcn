#!/bin/bash

echo "デプロイを開始します..."

# ビルド
echo "ビルドを実行中..."
yarn build --clean

# rsyncでデプロイ
echo "ファイルを転送中..."
rsync -avz --delete ./.output xs1:/var/www/bcn.winroad.biz/

# pm2の再起動（NVMのpm2パスを指定）
echo "pm2を再起動中..."
ssh xs1 'export NVM_DIR="$HOME/.nvm" && \
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && \
$HOME/.nvm/versions/node/v22.11.0/bin/pm2 restart bcn'

echo "デプロイが完了しました"