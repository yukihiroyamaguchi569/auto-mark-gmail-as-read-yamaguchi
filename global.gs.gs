// ラベルの名前を設定
const labelName = "AIチェック済";
const targetLabel = GmailApp.getUserLabelByName(labelName);

// OPEN AI APIキーを設定
const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

// 使用するモデルを指定
const model = 'gpt-4o-mini';