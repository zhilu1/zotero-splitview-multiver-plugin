(() => {
  const args = window.arguments?.[0];
  const attachments = args?.attachments ?? [];
  const title = args?.title ?? "Split View";
  const leftLabel = args?.leftLabel ?? "";
  const rightLabel = args?.rightLabel ?? "";

  const titleNode = document.getElementById("splitview-title");
  if (titleNode) {
    titleNode.textContent = title;
  }
  document.title = title;

  const leftLabelNode = document.getElementById("splitview-left-label");
  if (leftLabelNode) {
    leftLabelNode.textContent = leftLabel;
  }

  const rightLabelNode = document.getElementById("splitview-right-label");
  if (rightLabelNode) {
    rightLabelNode.textContent = rightLabel;
  }

  const leftSelect = document.getElementById("splitview-left");
  const rightSelect = document.getElementById("splitview-right");
  const leftFrame = document.getElementById("splitview-frame-left");
  const rightFrame = document.getElementById("splitview-frame-right");

  if (!leftSelect || !rightSelect || !leftFrame || !rightFrame) {
    return;
  }

  attachments.forEach((attachment, index) => {
    const leftOption = document.createElement("option");
    leftOption.value = String(index);
    leftOption.textContent = attachment.title || `PDF ${index + 1}`;
    leftSelect.appendChild(leftOption);

    const rightOption = document.createElement("option");
    rightOption.value = String(index);
    rightOption.textContent = attachment.title || `PDF ${index + 1}`;
    rightSelect.appendChild(rightOption);
  });

  const setFrameSource = (frame, index) => {
    const attachment = attachments[index];
    if (!attachment?.url) {
      return;
    }
    frame.setAttribute("src", attachment.url);
  };

  const updateFrames = () => {
    setFrameSource(leftFrame, Number(leftSelect.value));
    setFrameSource(rightFrame, Number(rightSelect.value));
  };

  leftSelect.addEventListener("change", updateFrames);
  rightSelect.addEventListener("change", updateFrames);

  leftSelect.value = "0";
  rightSelect.value = attachments.length > 1 ? "1" : "0";
  updateFrames();
})();
