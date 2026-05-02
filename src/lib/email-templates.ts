// Plain-text email templates. HTML 化は将来対応で十分。

export type EmailKind =
  | "order_received"
  | "order_approved"
  | "order_rejected"
  | "order_shipped"
  | "admin_new_order";

export type OrderEmailContext = {
  orderNumber: string;
  companyName: string;
  contactName: string;
  itemSummary?: string; // "ガルバ鋼板 ×10、単管バリケード ×2 ..."
  rejectReason?: string;
  adminUrl?: string; // 管理画面の発注詳細 URL（管理者向けのみ）
};

export type RenderedEmail = {
  subject: string;
  body: string;
};

export function renderEmail(
  kind: EmailKind,
  ctx: OrderEmailContext
): RenderedEmail {
  const greeting = `${ctx.companyName} ${ctx.contactName} 様`;
  switch (kind) {
    case "order_received":
      return {
        subject: `【ご発注受付】${ctx.orderNumber}`,
        body: [
          greeting,
          "",
          "ご発注を受け付けました。内容を確認のうえ、改めてご連絡いたします。",
          "",
          `発注番号: ${ctx.orderNumber}`,
          ctx.itemSummary ? `内容: ${ctx.itemSummary}` : "",
          "",
          "本メールへの返信は不要です。",
        ]
          .filter(Boolean)
          .join("\n"),
      };
    case "order_approved":
      return {
        subject: `【ご発注 承認】${ctx.orderNumber}`,
        body: [
          greeting,
          "",
          "ご発注を承認いたしました。出荷準備を進めさせていただきます。",
          "",
          `発注番号: ${ctx.orderNumber}`,
        ].join("\n"),
      };
    case "order_rejected":
      return {
        subject: `【ご発注 お断り】${ctx.orderNumber}`,
        body: [
          greeting,
          "",
          "誠に申し訳ございませんが、下記のご発注はお受けできませんでした。",
          "",
          `発注番号: ${ctx.orderNumber}`,
          ctx.rejectReason ? `理由: ${ctx.rejectReason}` : "",
          "",
          "ご不明な点がございましたら担当者までお問い合わせください。",
        ]
          .filter(Boolean)
          .join("\n"),
      };
    case "order_shipped":
      return {
        subject: `【ご発注 出荷】${ctx.orderNumber}`,
        body: [
          greeting,
          "",
          "ご発注の資材を出荷いたしました。",
          "",
          `発注番号: ${ctx.orderNumber}`,
        ].join("\n"),
      };
    case "admin_new_order":
      return {
        subject: `【新規発注】${ctx.orderNumber} - ${ctx.companyName}`,
        body: [
          "新しい発注が届きました。",
          "",
          `発注番号: ${ctx.orderNumber}`,
          `会社: ${ctx.companyName}`,
          `担当: ${ctx.contactName}`,
          ctx.itemSummary ? `内容: ${ctx.itemSummary}` : "",
          "",
          ctx.adminUrl ? `詳細: ${ctx.adminUrl}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      };
  }
}
