(function () {
  const converter = globalThis.SimpleChineseConverter;

  const textInput = document.getElementById("textInput");
  const status = document.getElementById("status");

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle("error", Boolean(isError));
  }

  function convertInputText(direction) {
    if (!converter || !textInput) {
      setStatus("轉換核心尚未載入", true);
      return;
    }

    const original = textInput.value || "";
    const converted = direction === "toTraditional" ? converter.tify(original) : converter.sify(original);
    textInput.value = converted;

    if (original === converted) {
      setStatus("沒有可轉換的文字");
    } else {
      setStatus("已完成輸入文字轉換");
    }
  }

  async function sendToActiveTab(action, direction) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      throw new Error("找不到目前分頁");
    }

    const response = await chrome.tabs.sendMessage(tab.id, { action, direction });
    if (!response || response.ok !== true) {
      throw new Error("分頁未回應，請重新整理頁面後再試");
    }

    return response.changed || 0;
  }

  async function runTabAction(action, direction, successPrefix) {
    try {
      const changed = await sendToActiveTab(action, direction);
      if (changed > 0) {
        setStatus(successPrefix + "，共 " + changed + " 處");
      } else {
        setStatus("沒有可轉換的內容");
      }
    } catch (error) {
      setStatus(error.message || "操作失敗", true);
    }
  }

  document.getElementById("toTraditionalText").addEventListener("click", () => {
    convertInputText("toTraditional");
  });

  document.getElementById("toSimplifiedText").addEventListener("click", () => {
    convertInputText("toSimplified");
  });

  document.getElementById("toTraditionalSelection").addEventListener("click", () => {
    runTabAction("convert-selection", "toTraditional", "已將選取內容轉為繁體");
  });

  document.getElementById("toSimplifiedSelection").addEventListener("click", () => {
    runTabAction("convert-selection", "toSimplified", "已將選取內容轉為簡體");
  });

  document.getElementById("toTraditionalPage").addEventListener("click", () => {
    runTabAction("convert-page", "toTraditional", "已將頁面轉為繁體");
  });

  document.getElementById("toSimplifiedPage").addEventListener("click", () => {
    runTabAction("convert-page", "toSimplified", "已將頁面轉為簡體");
  });
})();
