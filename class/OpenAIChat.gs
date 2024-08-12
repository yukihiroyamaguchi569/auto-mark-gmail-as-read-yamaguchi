// last update 2024-07-30

/**
 * class OpenAIChat
 * OpenAIのChat APIを使用して会話を行うクラス
 * 
 * プロパティ：
 * - apiKey - OpenAIのAPIキー
 * - urlChat - OpenAIのChat APIのエンドポイントURL
 * 
 * メソッド：
 * - askSimple(systemRole, prompt, model) - 一方向の質問をOpenAIのChat APIに送信し、応答を取得するメソッド
 * - talk(systemRole, aryObjMessage, model) - 会話履歴を利用して質問を送信し、応答を取得するメソッド
 * - imageInput(imgUrl, prompt, model) - 画像を入力として使用し、質問を送信して応答を取得するメソッド
 * - jsonFormat(text) - 与えられたテキストからJSON文字列を抜粋して出力するメソッド
 */

'use strict'

class OpenAIChat {
  /**
   * OpenAIChatクラスのコンストラクタ
   * 
   * @param {string} apiKey - OpenAIのAPIキー
   */

  constructor(apiKey) {
    this.apiKey = apiKey;
    this.urlChat = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * 一方向の質問をOpenAIのChat APIに送信し、応答を取得するメソッド
   * 
   * @param {string} systemRole - システムの役割を指定するメッセージ
   * @param {string} prompt - ユーザーからのプロンプト（質問）
   * @param {string} [model='gpt-4o-mini'] - 使用するモデル（デフォルトは 'gpt-4o-mini'）
   * @return {string} Chat APIからの応答テキスト
   */

  askSimple(systemRole, prompt, model = 'gpt-4o-mini') {
    // メッセージの配列を作成
    const aryObjMessage = [
      { role: 'system', content: systemRole },
      { role: 'user', content: prompt }
    ];

    // APIリクエストのペイロードを作成
    const payload = {
      model: model,
      messages: aryObjMessage,
    };

    // JSON形式に出力を制限する場合にpayloadにプロパティを追加
    // 2024-07-30 JSONモードを使用できるモデルを破壊的変更
    if (model === 'gpt-4o' || model === 'gpt-4-turbo' || model === 'gpt-4o-mini' || model === 'gpt-3.5-turbo') {
      if (systemRole.includes('JSON') && prompt.includes('JSON')) {
        payload.response_format = { type: 'json_object' }
      };
    };

    // APIリクエストのパラメータを設定
    const params = {
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      payload: JSON.stringify(payload),
      muteHttpExceptions: false // HTTP例外を無視しない
    };

    // APIリクエストを送信し、応答を取得
    const response = UrlFetchApp.fetch(this.urlChat, params).getContentText();
    const objChat = JSON.parse(response);
    if (objChat.choices.length === 0) { return 'ノーコメントです。' };
    const answer = objChat.choices[0].message.content;
    return answer;
  }

  /**
   * 会話履歴を利用して質問を送信し、応答を取得するメソッド
   * 
   * @param {string} systemRole - システムの役割を指定するメッセージ
   * @param {Array.<Object>} aryObjMessage - 会話履歴を含むメッセージオブジェクトの配列
   * @param {string} [model='gpt-4o-mini'] - 使用するモデル（デフォルトは 'gpt-4o-mini'）
   * @return {string} Chat APIからの応答テキスト
   */

  talk(systemRole, aryObjMessage, model = 'gpt-4o-mini') {
    // APIリクエストのペイロードを作成
    const payload = {
      model: model,
      messages: [{ role: 'system', content: systemRole }, ...aryObjMessage]
    };

    // APIリクエストのパラメータを設定
    const params = {
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      payload: JSON.stringify(payload),
      muteHttpExceptions: false // HTTP例外を無視しない
    };

    // APIリクエストを送信し、応答を取得
    const response = UrlFetchApp.fetch(this.urlChat, params).getContentText();
    const objChat = JSON.parse(response);
    if (objChat.choices.length === 0) { return 'ノーコメントです。' };
    const answer = objChat.choices[0].message.content;
    return answer;
  }

  /**
   * 画像を入力として使用し、質問を送信して応答を取得するメソッド
   * 
   * @param {string} imgUrl - 画像のURL
   * @param {string} prompt - ユーザーからのプロンプト（質問）
   * @param {string} [model='gpt-4o'] - 使用するモデル（デフォルトは 'gpt-4o'）
   * @return {string} Chat APIからの応答テキスト
   */

  imageInput(imgUrl, prompt, model = 'gpt-4o') {
    // メッセージの配列を作成
    const aryObjMessage = [
      {
        role: 'user',
        content: [{
          type: 'text',
          text: prompt
        },
        {
          type: 'image_url',
          image_url: {
            url: imgUrl
          }
        }
        ]
      }
    ];

    // APIリクエストのペイロードを作成
    const payload = {
      model: model,
      messages: aryObjMessage,
    };

    // APIリクエストのパラメータを設定
    const params = {
      contentType: 'application/json',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      payload: JSON.stringify(payload),
      muteHttpExceptions: false // HTTP例外を無視しない
    };

    // APIリクエストを送信し、応答を取得
    const response = UrlFetchApp.fetch(this.urlChat, params).getContentText();
    const objChat = JSON.parse(response);
    if (objChat.choices.length === 0) { return 'ノーコメントです。' };
    const answer = objChat.choices[0].message.content;
    return answer;
  }

  /**
   * 与えられたテキストからJSON文字列を抜粋して出力するメソッド
   * 
   * @param {string} text - 処理対象のテキスト
   * @return {string} - JSON文字列
   */

  jsonFormat(text) {
    // システムの役割と質問文を設定
    const systemRole = '与えられたテキストからJSON文字列を出力します。';
    const prompt = `与えられた#テキストから#JSON文字列部分のみを抜粋して出力してください。
    #テキスト
    ${text}
    `;

    // 使用するモデルを設定
    const model = 'gpt-4o-mini';

    // askSimpleメソッドを使用して質問を実行
    const answer = this.askSimple(systemRole, prompt, model);
    return answer;
  }

}

/**
 * OprnAI ChatAPIをテストする関数
 * @return {void}
 */

function testOpenAIChatAPI() {
  // APIキーを設定
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  // 使用するモデルを指定
  const model = 'gpt-4o-mini';
  // OpenAIChatクラスを初期化
  const openAIChat = new OpenAIChat(apiKey);
  // システムの役割を指定するメッセージ
  const systemRole = 'あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。'
  // ユーザーからのプロンプト
  const prompt = 'AIが得意なことは？苦手なこことは？';
  // 回答をコンソールに出力
  console.log(openAIChat.askSimple(systemRole, prompt, model));
}
