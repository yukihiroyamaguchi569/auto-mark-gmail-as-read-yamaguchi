// ラベルの名前を設定
const labelName = "AIチェック済";
const targetLabel = GmailApp.getUserLabelByName(labelName);

// 使用するモデルを指定
const model = 'gpt-4o-mini';

/**
 * スクリプトプロパティにLINEアクセストークンを書き込み、確認する関数
 * 初回のみ使用
 */

function setAndGetAccessToken(){
 const properties = PropertiesService.getScriptProperties();

 properties.setProperty('LINE_NOTIFY_TOKEN','ここにTOKENを書く');
 
 const accessToken = properties.getProperty("LINE_NOTIFY_TOKEN");

 console.log(accessToken)

}

/**
 * スクリプトプロパティにOPEN AI APIキーを書き込み、確認する関数
 * 初回のみ使用
 */

function setAndGetAccessToken(){
 const properties = PropertiesService.getScriptProperties();

 properties.setProperty('OPENAI_API_KEY','ここにAPIキーを書く');
 
 const accessToken = properties.getProperty("OPENAI_API_KEY");

 console.log(accessToken)

}