// last update 2024-08-10

/**
 * LINE Notifyにメッセージを送信するクラス
 * 
 * プロパティ：
 * - accessToken - LINE Notifyのアクセストークン
 * - url - LINE NotifyのAPIエンドポイントURL
 * 
 * メソッド：
 * - send(message) - メッセージを送信するメソッド
 * 
 */

'use strict'

class LineNotify {
  /**
   * コンストラクタ
   * @param {string} accessToken - LINE Notifyのアクセストークン
   */

  constructor(accessToken) {
    this.accessToken = accessToken;
    this.url = 'https://notify-api.line.me/api/notify';
  }

  /**
   * メッセージを送信するメソッド
   * @param {string} message - 送信するメッセージ
   * @return {string} レスポンス内容
   */

  send(message) {
    // 送信するデータを作成する
    const objPayload = { message: message };

    // オプションを設定する
    const objOptions = {
      method: 'post',
      headers: { 'Authorization': 'Bearer ' + this.accessToken },
      payload: objPayload
    };

    // リクエストを送信する
    const response = UrlFetchApp.fetch(this.url, objOptions);

    // レスポンスをログに出力する
    return response.getContentText();
  }
}

/**
 * LineNotifyクラスを使ってLINE Notifyにメッセージを送信するテスト関数
 */

function testLineNotify() {
  // アクセストークンを設定
  const accessToken = PropertiesService.getScriptProperties().getProperty('LINE_NOTIFY_TOKEN');
  // テスト送信するメッセージ
  const message = 'こんにちは！これはテストメッセージだよ。';
  // メッセージを送信
  new LineNotify(accessToken).send(message);
}

/**
 * スクリプトプロパティにLINEアクセストークンを書き込み、確認する関数
 * 初回のみ使用
 */

function setAndGetAccessToken(){
 const properties = PropertiesService.getScriptProperties();

 properties.setProperty('LINE_NOTIFY_TOKEN','qKbt27uVZlSwjz1JlkJCxJmJ4Ku9BydnpTrnoKvs2tx');
 
 const accessToken = properties.getProperty("LINE_NOTIFY_TOKEN");

 console.log(accessToken)

}