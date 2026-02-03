import { getString } from "../utils/locale";

const SPLIT_VIEW_MENU_ID = "zotero-itemmenu-splitview-pdf-versions";

export const SplitViewFactory = {
  registerMenu() {
    ztoolkit.Menu.register("item", {
      tag: "menuitem",
      id: SPLIT_VIEW_MENU_ID,
      label: getString("splitview-menu-label"),
      commandListener: () => {
        void openSplitViewFromSelection();
      },
    });
  },
};

async function openSplitViewFromSelection() {
  const zoteroPane = Zotero.getActiveZoteroPane();
  const selectedItems = zoteroPane?.getSelectedItems() ?? [];
  if (!selectedItems.length) {
    Zotero.alert(
      zoteroPane?.document?.defaultView ?? window,
      getString("splitview-alert-title"),
      getString("splitview-alert-no-selection"),
    );
    return;
  }

  const selectedPdfAttachments = selectedItems.filter(
    (item) => item.isPDFAttachment(),
  );
  let pdfAttachments = selectedPdfAttachments;

  if (pdfAttachments.length < 2) {
    const baseItem = await resolveParentItem(selectedItems[0]);
    pdfAttachments = await getPdfAttachments(baseItem);
  }

  const attachmentData = pdfAttachments
    .map((attachment) => ({
      id: attachment.id,
      title: attachment.getField("title"),
      url: attachment.getLocalFileURL(),
    }))
    .filter((attachment) => Boolean(attachment.url));

  if (attachmentData.length < 2) {
    Zotero.alert(
      zoteroPane?.document?.defaultView ?? window,
      getString("splitview-alert-title"),
      getString("splitview-alert-not-enough"),
    );
    return;
  }

  const windowArgs = {
    title: getString("splitview-window-title"),
    leftLabel: getString("splitview-left-label"),
    rightLabel: getString("splitview-right-label"),
    attachments: attachmentData,
  };

  Zotero.openDialog(
    `chrome://${addon.data.config.addonRef}/content/splitView.xhtml`,
    "_blank",
    "chrome,centerscreen,resizable,dialog=no",
    windowArgs,
  );
}

async function resolveParentItem(item: Zotero.Item) {
  if (!item.isAttachment()) {
    return item;
  }

  if (!item.parentItemID) {
    return item;
  }

  const parent = Zotero.Items.get(item.parentItemID);
  if (parent) {
    return parent;
  }

  return Zotero.Items.getAsync(item.parentItemID);
}

async function getPdfAttachments(item: Zotero.Item) {
  const attachmentIDs = item.getAttachments();
  const attachments = attachmentIDs
    .map((id) => Zotero.Items.get(id))
    .filter((attachment): attachment is Zotero.Item => Boolean(attachment));

  return attachments.filter((attachment) => attachment.isPDFAttachment());
}
