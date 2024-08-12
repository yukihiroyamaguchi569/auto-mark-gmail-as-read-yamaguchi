// last update 2024-08-10

/**
 * - triggerMarkEmailAsRead - 未読メールを取得し、その重要性を分析してメールをLINEに通知または既読にする関数
 * - getAllUnreadEmails_ - 全ての未読メールのIDと本文をオブジェクトで返す関数
 * - markMailAsRead_ - メールのメッセージIDと既読フラグを受け取って、メールを既読にする関数
 */

/**
 * インストーラブルトリガー：
 * 時間主導型/時間ベースのタイマー/4時間おき
 * 
 * 未読メールを取得し、その重要性を分析してLINEへの通知と既読にする関数
 * @return {void}
 */

function triggerMarkEmailAsRead() {

  //  全ての未読メールのIDと本文をオブジェクトで取得
  const aryObjEmail = getAllUnreadEmails_();

  // 新しいメッセージがなければ処理を中止
  if (aryObjEmail.length === 0) { return };

  /**
   * 最後に未読メッセージを確認した日付を取得する関数
   * プロパティストアに記録が無い場合は1年前の日付を返す
   *
   * @return {Date} dateLastUnread - 最後に未読メッセージを確認した日付
   */

  // const getDateLastUnread = () => {
  //   // プロパティストアから最後に未読メッセージを確認した日付を取得
  //   const strDateLastUnread = PropertiesService.getScriptProperties().getProperty('DATE_LAST_UNREAD');

  //   // 日付が存在する場合はその日付を返す
  //   if (strDateLastUnread) {
  //     return new Date(strDateLastUnread)
  //   };

  //   // 日付が存在しない場合は1ヶ月前の日付を計算して返す
  //   const now = new Date();
  //   const dateOneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  //   return new Date(dateOneMonthAgo);
  // };

  // // 最後の未読メールの日付を取得
  // const dateLastUnread = getDateLastUnread();

  // // 最後の未読メールの日付以降のメールをフィルタリングし、日付でソート
  // const aryFilEmail = aryObjEmail.filter(email => email.date > dateLastUnread).sort((a, b) => a.date - b.date);

  // 新しいメッセージがなければ処理を中止
  if (aryObjEmail.length === 0) {
        console.log("新しいメールはありません") ;
        return 
        };

  // APIキーを設定
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

  // 使用するモデルを指定
  const model = 'gpt-4o-mini';

  // OpenAIChatクラスを初期化
  const openAIChat = new OpenAIChat(apiKey);

  // リアクションが必要かどうかの閾値を1-10段階で設定
  const numNeedReaction = 6;

  // フィルタリングされたメールを解析
  const analyzedAryObjEmail = aryObjEmail.map(objEmail => {

    console.log(objEmail.subject);

    // メール本文を取得
    const body = objEmail.body;

    // システムロールの設定
    const systemRole = "あなたは「だよ・だね」と親しみやすい言葉で話すAIアシスタントです。あなたは、メールの本文を解析し、そのメールが返信や他のリアクションが必要かどうかを0から10の数値で判別します。回答は必ずJSON形式で出力します。";
   
    // プロンプトの設定
    const prompt = '以下のメール本文を評価してください。リアクションが必要かどうかを0から10のスケールで数値で示し、リアクションが必要な理由とメール本文の要約を併せて指定されたJSONスキーマで出力してください。'
      + '### メール本文:' + body + '\n'
      + '### 出力JSONスキーマ:{"necessity": [0から10のスケールの数値],"reason": [リアクションが必要な理由],"summary": [メール本文の要約]}';

    // OpenAIChat APIを使って応答を取得
    const response = openAIChat.askSimple(systemRole, prompt, model);

    // 応答を待機
    Utilities.sleep(10000);

    // 応答をJSONとして解析
    const objJson = JSON.parse(response);

    // メールIDを追加
    objJson.id = objEmail.id;

    // メール受信日時を追加
    objJson.date = objEmail.date;

    // メール件名を追加
    objJson.subject = objEmail.subject;

    console.log("解析",objEmail.subject,"objJson.necessity",objJson.necessity);

    // チェック済のラベルをつける
    setLabel_(objEmail.id);

    // 最後の未読メールの日付を更新
    // PropertiesService.getScriptProperties().setProperty('DATE_LAST_UNREAD', objEmail.date);

    // 解析結果を返す
    return objJson;
  });

  // ユーザーのメールアドレスを取得
  const userEmail = Session.getActiveUser().getEmail();

  // Line Notifyのアクセストークンを取得
  const accessToken = PropertiesService.getScriptProperties().getProperty('LINE_NOTIFY_TOKEN');

  // 解析結果に応じてメールをLINEに通知または既読にする
  analyzedAryObjEmail.forEach(objMail => {
    const message = '未読のメールのサマリーだよ' + '\n\n'
      + '= = = = = = = =' + '\n'
      + '件名: ' + objMail.subject + '\n'
      + '= = = = = = = =' + '\n' + '\n'
      + '受信日時:' + Utilities.formatDate(objMail.date, 'JST', 'yyyy-MM-dd HH:mm') + '\n\n'
      + 'リアクションの必要性:' + objMail.necessity + '\n' + '\n'
      + '必要な理由:' + '\n' + objMail.reason + '\n\n'
      + '内容の要約:' + '\n' + objMail.summary + '\n\n'
      + 'メールへのリンク:' + `https://mail.google.com/mail/u/${userEmail}/#inbox/${objMail.id}`;

    // リアクションの必要性が高い場合、LINEに通知する
    if (objMail.necessity >= numNeedReaction) { new LineNotify(accessToken).send(message) };

    // リアクションの必要性が低い場合、メールにタグをつける
    // if (objMail.necessity < numNeedReaction) { markMailAsRead_(objMail.id, true) };

  })
}

/**
 * 全ての未読メールのIDと本文をオブジェクトで返す関数
 * 
 * @return {Array.<Object.<string, string>>} 全ての未読メールのIDと本文の配列
 */

function getAllUnreadEmails_() {

  // 過去のメールを検索するクエリ
    const query = 'newer_than:2h　-label:"AIチェック済"';

  // 過去2日間のメールを検索
  const aryThreads = GmailApp.search(query);
  // 未読メールスレッドを全て取得する
  // const aryThreads = GmailApp.search('is:unread');

  // メールのIDと本文をオブジェクトにまとめる
  const aryObjEmail = aryThreads.flatMap(thread => {
    const aryMessages = thread.getMessages();
    return aryMessages.filter(message => message.isUnread()).map(message => {
      return {
        id: message.getId(),
        body: message.getPlainBody(),
        date: message.getDate(),
        subject: message.getSubject()
      };
    });
  });

  return aryObjEmail;
}

/**
 * メールのメッセージIDと既読フラグを受け取って、メールを既読にする関数
 *
 * @param {string} idMessage - メールのメッセージID
 * @param {boolean} isRead - メールを既読にするかどうかのフラグ
 * @return {void}
 */

function markMailAsRead_(idMessage, isRead) {
  // Gmailのメッセージを取得する
  const message = GmailApp.getMessageById(idMessage);

  // メッセージが存在し、かつisReadがtrueの場合はメールを既読にする
  if (message && isRead) { message.markRead() };
}

function setLabel_(idMessage){
  // Gmailのメッセージを取得する
  const message = GmailApp.getMessageById(idMessage);
  const thread = message.getThread();

  //　ラベルをつける
  targetLabel.addToThread(thread);

}
