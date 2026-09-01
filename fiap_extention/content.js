console.log(
  `FIAP Tools ${chrome.runtime.getManifest().version} iniciado!`
);

// verifica versionamento para ver se tem atualização
fetch("https://fiap.webart3.com/config/getversion").then((response) => {
  response.json().then((data) => {

    // manifest version
    var manifestData = chrome.runtime.getManifest();
    var manifestVersion = manifestData.version;

    const hasNewerVersion =
      String(data.version).localeCompare(String(manifestVersion), undefined, {
        numeric: true,
        sensitivity: "base",
      }) > 0;

    if (hasNewerVersion) {

      // alert("Atualização disponível para o FIAP Tools! Versão atual: " + manifestVersion + " Versão disponível: " + data.version);

      let style = document.createElement('style');
      style.innerHTML = `
        .popup {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 300px;
          background-color: #2e2e2e;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
          z-index: 1011;
        }

        .popup-header {
          background-color: #ed145b;
          color: #fff;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .popup-title {
          font-size: 16px;
        }

        .popup-close {
          cursor: pointer;
          font-size: 20px;
          line-height: 20px;
        }

        .popup-body {
          padding: 15px;
          text-align: center;
        }

        .popup-button {
          background-color: #ed145b;
          color: #fff;
          border: none;
          padding: 10px 15px;
          margin: 5px;
          cursor: pointer;
          border-radius: 5px;
          transition: background-color 0.3s;
        }

        .popup-button:hover {
          transition: 0.5s;
          background-color: #2e2e2e;
          color: #ed145b;
        }
      `;

      document.head.appendChild(style);

      let div = document.createElement('div');
      div.innerHTML = `
          <div class="popup-header">
              <span class="popup-title">Atualização disponível para o FIAP Tools!</span>
              <span class="popup-close" id="popup-close">&times;</span>
          </div>
          <div class="popup-body">
              <button class="popup-button" onclick="window.open('${data.download}', '_blank')">Atualizar agora</button>
              <button class="popup-button" onclick="window.open('${data.project}', '_blank')">Ver projeto</button>
          </div>`;
      div.id = 'popup';
      div.className = 'popup';
      document.body.appendChild(div);

      document.getElementById('popup-close').onclick = function() {
        document.getElementById('popup').style.display = 'none';
      }

    }

  });
});

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createProgressBar() {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor =
    "rgba(0, 0, 0, 0.5)"; /* Semi-transparent black */
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "1000"; /* Make sure it's on top */

  // Create wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "wrapper-progress-bar";
  wrapper.style.width = "350px";
  wrapper.style.backgroundColor = "#f3f4f6"; /* Light gray */
  wrapper.style.borderRadius = "0.375rem"; /* Rounded corners */
  wrapper.style.overflow = "hidden";
  wrapper.style.position = "fixed";
  wrapper.style.bottom = "0";
  wrapper.style.left = "0";
  wrapper.style.zIndex = "2147483647";
  wrapper.style.pointerEvents = "none";
  wrapper.style.color = "#2563eb";
  wrapper.style.padding = "1rem";
  wrapper.style.fontWeight = "bold";
  wrapper.style.display = "flex";
  wrapper.style.flexDirection = "column";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.textContent = "Analisando perguntas com o FIAP Extention";
  const { showIndicators } = await chrome.storage.local.get("showIndicators");
  if (!showIndicators) wrapper.style.display = "none";
  // Create container
  const container = document.createElement("div");
  container.className = "container-progress-bar";
  container.style.width = "100%";
  container.style.backgroundColor = "#e5e7eb"; /* Light gray */
  container.style.borderRadius = "9999px"; /* Full rounded corners */
  container.style.overflow = "hidden";

  // Create progress bar
  const progressBar = document.createElement("div");
  progressBar.className = "progress-bar";
  progressBar.style.width = "0";
  progressBar.style.height = "1rem";
  progressBar.style.backgroundColor = "#2563eb"; /* Blue */
  progressBar.style.textAlign = "center";
  progressBar.style.color = "#dbeafe"; /* Light blue */
  progressBar.style.fontSize = "0.75rem";
  progressBar.style.fontWeight = "500";
  progressBar.style.lineHeight = "1";
  progressBar.style.borderRadius = "9999px"; /* Full rounded corners */
  progressBar.style.transition = "width 0.5s ease"; /* Smooth transition */
  progressBar.textContent = "0%";

  // Append elements
  container.appendChild(progressBar);
  wrapper.appendChild(container);
  //   overlay.appendChild(wrapper);
  document.body.append(wrapper);

  // Return the progress bar element for further updates
  return { wrapper, progressBar };
}

// Function to update the progress bar
function updateProgressBar(progressBar, progress) {
  progressBar.style.width = progress + "%";
  progressBar.textContent = progress + "%";
}

function showQuickToast(message, duration = 2200) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.background = "rgba(17, 24, 39, 0.95)";
  toast.style.color = "#fff";
  toast.style.padding = "10px 14px";
  toast.style.borderRadius = "8px";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "2000";
  toast.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.25)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.2s ease";

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

function getReactInternal(el) {
  if (!el) return null;
  const keys = Object.keys(el);
  const fiberKey = keys.find((k) => k.startsWith("__reactFiber$"));
  const propsKey = keys.find((k) => k.startsWith("__reactProps$"));
  console.log("[FIAP DEBUG] getReactInternal", {
    hasElement: !!el,
    foundFiberKey: !!fiberKey,
    foundPropsKey: !!propsKey,
  });
  return fiberKey ? el[fiberKey] : propsKey ? el[propsKey] : null;
}

function deepFindQuestionObject(obj) {
  const seen = new Set();

  function walk(x) {
    if (!x || typeof x !== "object") return null;
    if (seen.has(x)) return null;
    seen.add(x);

    const hasText = typeof x.text === "string" || typeof x.statement === "string";
    const hasAnswers = Array.isArray(x.answers) || Array.isArray(x.options);
    if (x.id != null && hasText && hasAnswers) return x;

    for (const k of Object.keys(x)) {
      const res = walk(x[k]);
      if (res) return res;
    }
    return null;
  }

  return walk(obj);
}

function getQuestionFromContainer(containerEl) {
  const root =
    containerEl.querySelector(
      '[class*="question-content"], .styles_questionContent__SQsLL'
    ) || containerEl;
  let fiber = getReactInternal(root);
  if (!fiber) return null;

  if (fiber && fiber.memoizedProps == null && fiber.pendingProps == null) {
    return deepFindQuestionObject(fiber);
  }

  for (let i = 0; i < 40 && fiber; i++) {
    const props = fiber.memoizedProps || fiber.pendingProps;
    const q = deepFindQuestionObject(props);
    if (q) return q;
    fiber = fiber.return;
  }
  return null;
}

let htmlEntityDecoderEl = null;
function decodeHtmlEntities(s) {
  if (s == null) return "";
  if (!htmlEntityDecoderEl) {
    htmlEntityDecoderEl = document.createElement("div");
  }
  let current = String(s);
  for (let i = 0; i < 5; i++) {
    if (i > 0 && !/[&][a-zA-Z#0-9]+;/.test(current)) break;
    htmlEntityDecoderEl.innerHTML = current;
    const decoded = htmlEntityDecoderEl.textContent || "";
    if (decoded === current) break;
    current = decoded;
  }
  return current;
}

function normText(s) {
  return decodeHtmlEntities(s)
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim()
    .toLowerCase();
}

function getElementText(element) {
  return element?.innerText || element?.textContent || "";
}

function queryFirst(element, selectors) {
  for (const selector of selectors) {
    const found = element?.querySelector(selector);
    if (found) return found;
  }
  return null;
}

function normSearchText(value) {
  return normText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseQuestionNumberFromText(value) {
  const match = normSearchText(value).match(/\bquestao\s*(\d+)\b/i);
  return match ? Number(match[1]) : null;
}

function getSemanticQuestionContainers(rootEl) {
  const modernAndLegacy = Array.from(
    rootEl.querySelectorAll(
      [
        '[class*="question-container"]',
        '[class*="questionContainer"]',
        ".on-fast-test-question-container",
      ].join(", ")
    )
  );
  const candidates = modernAndLegacy.length
    ? modernAndLegacy
    : Array.from(rootEl.querySelectorAll("[data-question-id]"));

  return [...new Set(candidates)].filter((container) =>
    container.querySelector('[role="radio"]')
  );
}

function getSemanticQuestionNumber(containerEl) {
  const title = queryFirst(containerEl, [
    '[class*="question-title"]',
    '[class*="questionTitle"]',
    ".on-fast-test-question-title",
  ]);
  return parseQuestionNumberFromText(getElementText(title));
}

function getSemanticQuestionStatement(containerEl) {
  const statement = queryFirst(containerEl, [
    '[class*="statement"]',
    ".on-fast-test-question-text",
    "[data-question-text]",
  ]);
  return getElementText(statement).trim();
}

function getSemanticAnswerText(buttonEl) {
  const label = queryFirst(buttonEl, [
    '[class*="label"]',
    ".on-fast-test-answer-text",
    "[data-answer-text]",
  ]);
  return getElementText(label || buttonEl);
}

function findSemanticAnswerButton(containerEl, answerText) {
  const normalizedAnswer = normText(answerText);
  const buttons = Array.from(
    containerEl.querySelectorAll('button[role="radio"], [role="radio"]')
  );
  const exactMatches = buttons.filter(
    (button) => normText(getSemanticAnswerText(button)) === normalizedAnswer
  );
  if (exactMatches.length === 1) return exactMatches[0];

  // Some layouts prefix the option with a letter ("A.", "B.", ...).
  const partialMatches = buttons.filter((button) => {
    const visibleText = normText(getSemanticAnswerText(button));
    return (
      visibleText.includes(normalizedAnswer) ||
      normalizedAnswer.includes(visibleText)
    );
  });
  return partialMatches.length === 1 ? partialMatches[0] : null;
}

function normRenderedText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function findVisibleTextElements(rootEl, apiText) {
  const targetText = normText(apiText);
  if (!targetText) return [];

  const candidates = Array.from(
    rootEl.querySelectorAll(
      [
        "button",
        '[role="radio"]',
        "label",
        '[class*="answer"]',
        '[class*="option"]',
        '[class*="label"]',
        '[class*="statement"]',
        '[class*="question"]',
        "p",
        "span",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
      ].join(", ")
    )
  );
  const exactMatches = candidates.filter(
    (element) => normRenderedText(getElementText(element)) === targetText
  );
  const matches = exactMatches.length
    ? exactMatches
    : candidates.filter((element) => {
        const renderedText = normRenderedText(getElementText(element));
        return renderedText && renderedText.includes(targetText);
      });

  // Prefer the deepest node carrying the text, not all of its wrappers.
  return matches.filter(
    (element) =>
      !matches.some(
        (other) => other !== element && element.contains?.(other)
      )
  );
}

function getTreeDistance(first, second) {
  const firstAncestors = new Map();
  let current = first;
  let distance = 0;
  while (current) {
    firstAncestors.set(current, distance++);
    current = current.parentElement;
  }

  current = second;
  distance = 0;
  while (current) {
    if (firstAncestors.has(current)) {
      return firstAncestors.get(current) + distance;
    }
    current = current.parentElement;
    distance++;
  }
  return Number.POSITIVE_INFINITY;
}

function getAnswerHighlightTarget(element) {
  return (
    element?.closest?.('button[role="radio"], [role="radio"], button, label') ||
    element?.closest?.('[class*="answer"], [class*="option"]') ||
    element?.parentElement ||
    element
  );
}

function findAnswerGloballyByVisibleText(rootEl, questionFromApi, answerText) {
  const answerElements = findVisibleTextElements(rootEl, answerText);
  if (answerElements.length === 0) return null;

  const uniqueTargets = [
    ...new Set(answerElements.map(getAnswerHighlightTarget).filter(Boolean)),
  ];
  if (uniqueTargets.length === 1) {
    return { buttonEl: uniqueTargets[0], strategy: "unique-global-answer-text" };
  }

  let questionElements = findVisibleTextElements(
    rootEl,
    questionFromApi?.text ?? questionFromApi?.statement ?? ""
  );
  if (questionElements.length === 0) {
    questionElements = findVisibleTextElements(rootEl, questionFromApi?.name ?? "");
  }
  if (questionElements.length === 0) return null;

  const rankedTargets = uniqueTargets
    .map((buttonEl) => ({
      buttonEl,
      distance: Math.min(
        ...questionElements.map((questionEl) =>
          getTreeDistance(questionEl, buttonEl)
        )
      ),
    }))
    .sort((first, second) => first.distance - second.distance);

  if (
    rankedTargets.length > 1 &&
    rankedTargets[0].distance === rankedTargets[1].distance
  ) {
    return null;
  }
  return {
    buttonEl: rankedTargets[0].buttonEl,
    strategy: "question-and-answer-visible-text",
  };
}

function describeQuestionContainer(containerEl) {
  const domStatement = getSemanticQuestionStatement(containerEl);
  const domQuestionId = getQuestionIdFromDom(containerEl);
  const reactQuestion = domStatement ? null : getQuestionFromContainer(containerEl);
  return {
    containerEl,
    questionId: domQuestionId ?? reactQuestion?.id ?? null,
    number: getSemanticQuestionNumber(containerEl),
    statement:
      domStatement ||
      reactQuestion?.text ||
      reactQuestion?.statement ||
      "",
    allText: getElementText(containerEl),
  };
}

const questionDescriptorCache = new WeakMap();

function getQuestionDescriptors(rootEl) {
  let descriptors = questionDescriptorCache.get(rootEl);
  if (!descriptors) {
    descriptors = getSemanticQuestionContainers(rootEl).map(
      describeQuestionContainer
    );
    questionDescriptorCache.set(rootEl, descriptors);
  }
  return descriptors;
}

function findQuestionContainer(rootEl, questionFromApi, answerText) {
  const descriptors = getQuestionDescriptors(rootEl);
  const questionId = String(questionFromApi?.id ?? "");

  const byId = descriptors.filter(
    (item) => item.questionId != null && String(item.questionId) === questionId
  );
  if (byId.length === 1) return { ...byId[0], strategy: "question-id" };

  const normalizedStatement = normText(
    questionFromApi?.text ?? questionFromApi?.statement ?? ""
  );
  if (normalizedStatement) {
    const byStatement = descriptors.filter(
      (item) => normText(item.statement) === normalizedStatement
    );
    if (byStatement.length === 1) {
      return { ...byStatement[0], strategy: "question-text" };
    }

    const byContainedStatement = descriptors.filter((item) =>
      normText(item.allText).includes(normalizedStatement)
    );
    if (byContainedStatement.length === 1) {
      return { ...byContainedStatement[0], strategy: "question-text-contained" };
    }
  }

  const apiQuestionNumber = parseQuestionNumberFromText(questionFromApi?.name ?? "");
  if (apiQuestionNumber != null) {
    const byNumber = descriptors.filter(
      (item) => item.number === apiQuestionNumber
    );
    if (byNumber.length === 1) {
      return { ...byNumber[0], strategy: "question-number" };
    }
  }

  // Use the answer text only when it identifies one question unambiguously.
  const byUniqueAnswer = descriptors.filter((item) =>
    findSemanticAnswerButton(item.containerEl, answerText)
  );
  if (byUniqueAnswer.length === 1) {
    return { ...byUniqueAnswer[0], strategy: "unique-answer-text" };
  }

  return null;
}

const correctAnswerStyles = `
  .fiap-tools-correct-answer {
    position: relative !important;
    padding-right: 10.5rem !important;
    border-color: rgba(34, 197, 94, 0.82) !important;
    border-left: 4px solid #22c55e !important;
    background: linear-gradient(
      90deg,
      rgba(34, 197, 94, 0.16) 0%,
      rgba(34, 197, 94, 0.07) 58%,
      rgba(34, 197, 94, 0.02) 100%
    ) !important;
    box-shadow:
      0 0 0 1px rgba(34, 197, 94, 0.24),
      0 8px 22px rgba(15, 118, 60, 0.12) !important;
    transition:
      border-color 160ms ease,
      background-color 160ms ease,
      box-shadow 160ms ease,
      transform 160ms ease !important;
  }

  .fiap-tools-correct-answer:hover {
    box-shadow:
      0 0 0 1px rgba(34, 197, 94, 0.34),
      0 10px 26px rgba(15, 118, 60, 0.18) !important;
    transform: translateY(-1px);
  }

  .fiap-tools-correct-answer [class*="radio"] {
    border-color: #22c55e !important;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.13) !important;
  }

  .fiap-tools-answer-badge {
    position: absolute;
    top: 50%;
    right: 0.875rem;
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    transform: translateY(-50%);
    padding: 0.3rem 0.58rem;
    border: 1px solid rgba(34, 197, 94, 0.42);
    border-radius: 999px;
    background: rgba(20, 83, 45, 0.92);
    color: #dcfce7;
    font: 700 0.64rem/1 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    letter-spacing: 0.055em;
    text-transform: uppercase;
    white-space: nowrap;
    pointer-events: none;
  }

  .fiap-tools-answer-badge-check {
    display: inline-grid;
    width: 1rem;
    height: 1rem;
    place-items: center;
    border-radius: 50%;
    background: #22c55e;
    color: #052e16;
    font-size: 0.7rem;
    letter-spacing: 0;
  }

  @media (max-width: 640px) {
    .fiap-tools-correct-answer {
      padding-right: 4rem !important;
    }

    .fiap-tools-answer-badge-label {
      display: none;
    }
  }
`;

function ensureCorrectAnswerStyles(buttonEl) {
  const rootEl = buttonEl.getRootNode?.() || buttonEl.ownerDocument || document;
  if (rootEl.querySelector?.("#fiap-tools-correct-answer-styles")) return;

  const target = rootEl.head || (rootEl.host ? rootEl : null);
  const ownerDocument = rootEl.ownerDocument || rootEl;
  if (!target?.appendChild || !ownerDocument?.createElement) return;

  const style = ownerDocument.createElement("style");
  style.id = "fiap-tools-correct-answer-styles";
  style.textContent = correctAnswerStyles;
  target.appendChild(style);
}

function ensureCorrectAnswerBadge(buttonEl) {
  if (
    buttonEl.querySelector?.(".fiap-tools-answer-badge") ||
    typeof buttonEl.appendChild !== "function"
  ) {
    return;
  }

  const ownerDocument = buttonEl.ownerDocument || document;
  const badge = ownerDocument.createElement("span");
  const check = ownerDocument.createElement("span");
  const label = ownerDocument.createElement("span");
  badge.className = "fiap-tools-answer-badge";
  badge.setAttribute("aria-hidden", "true");
  check.className = "fiap-tools-answer-badge-check";
  check.textContent = "✓";
  label.className = "fiap-tools-answer-badge-label";
  label.textContent = "Comunidade";
  badge.append(check, label);
  buttonEl.appendChild(badge);
}

function applyCorrectAnswerHighlight(buttonEl, questionId) {
  ensureCorrectAnswerStyles(buttonEl);
  buttonEl.classList.add("fiap-tools-correct-answer");
  buttonEl.setAttribute("data-fiap-tools-correct-answer", "true");
  buttonEl.setAttribute("data-fiap-tools-question-id", String(questionId));
  ensureCorrectAnswerBadge(buttonEl);
}

function highlightAnswerUsingQuestionContext(rootEl, questionFromApi, answerId) {
  if (!rootEl || !questionFromApi || answerId == null) return false;

  const answers = Array.isArray(questionFromApi.answers)
    ? questionFromApi.answers
    : [];
  const answerObj = answers.find(
    (item) => String(item?.id) === String(answerId)
  );
  if (!answerObj) {
    console.log("[FIAP DEBUG] answer id not found in API question", {
      questionId: questionFromApi.id,
      answerId,
      availableAnswerIds: answers.map((item) => item?.id),
    });
    return false;
  }

  const answerText = answerObj.text ?? answerObj.label ?? "";
  const questionMatch = findQuestionContainer(
    rootEl,
    questionFromApi,
    answerText
  );
  let buttonEl = questionMatch
    ? findSemanticAnswerButton(questionMatch.containerEl, answerText)
    : null;
  let matchStrategy = questionMatch?.strategy ?? null;

  if (!buttonEl) {
    const globalMatch = findAnswerGloballyByVisibleText(
      rootEl,
      questionFromApi,
      answerText
    );
    buttonEl = globalMatch?.buttonEl ?? null;
    matchStrategy = globalMatch?.strategy ?? matchStrategy;
  }

  if (!buttonEl) {
    console.log("[FIAP DEBUG] answer button not found by semantic context", {
      questionId: questionFromApi.id,
      questionName: questionFromApi.name,
      answerId,
      answerText,
      normalizedQuestionText: normText(questionFromApi.text),
      normalizedAnswerText: normText(answerText),
      matchStrategy,
      totalContainers: getSemanticQuestionContainers(rootEl).length,
    });
    return false;
  }

  applyCorrectAnswerHighlight(buttonEl, questionFromApi.id);
  console.log("[FIAP DEBUG] correct answer highlighted", {
    questionId: questionFromApi.id,
    answerId,
    answerText,
    matchStrategy,
  });
  return true;
}

function getQuestionIdFromDom(containerEl) {
  if (!containerEl) return null;

  const ownId = containerEl.getAttribute("data-question-id");
  if (ownId != null && ownId !== "") return ownId;

  const nestedWithId = containerEl.querySelector("[data-question-id]");
  const nestedId = nestedWithId?.getAttribute("data-question-id");
  if (nestedId != null && nestedId !== "") return nestedId;

  const parentWithId = containerEl.closest("[data-question-id]");
  const parentId = parentWithId?.getAttribute("data-question-id");
  if (parentId != null && parentId !== "") return parentId;

  return null;
}

let cachedFastTestRoots = null;

function getAccessibleFastTestRoots() {
  if (cachedFastTestRoots) return cachedFastTestRoots;

  const roots = [];
  const pending = [document];
  const seen = new Set();

  while (pending.length > 0) {
    const rootEl = pending.shift();
    if (!rootEl || seen.has(rootEl)) continue;
    seen.add(rootEl);
    roots.push(rootEl);

    for (const element of rootEl.querySelectorAll?.("*") || []) {
      if (element.shadowRoot && !seen.has(element.shadowRoot)) {
        pending.push(element.shadowRoot);
      }
    }

    for (const iframe of rootEl.querySelectorAll?.("iframe") || []) {
      try {
        if (iframe.contentDocument && !seen.has(iframe.contentDocument)) {
          pending.push(iframe.contentDocument);
        }
      } catch (error) {
        console.log("[FIAP DEBUG] iframe is not accessible", error);
      }
    }
  }
  cachedFastTestRoots = roots;
  return cachedFastTestRoots;
}

const knownCommunityAnswers = new Map();
const observedFastTestRoots = new WeakSet();
let reapplyHighlightsTimer = null;

function rememberKnownAnswer(question, answerId) {
  knownCommunityAnswers.set(String(question.id), { question, answerId });
}

function observeFastTestRoot(rootEl) {
  if (
    typeof MutationObserver === "undefined" ||
    !rootEl ||
    observedFastTestRoots.has(rootEl)
  ) {
    return;
  }

  const observationTarget = rootEl.documentElement || rootEl;
  if (!observationTarget) return;

  const observer = new MutationObserver(() => {
    cachedFastTestRoots = null;
    questionDescriptorCache.delete(rootEl);
    clearTimeout(reapplyHighlightsTimer);
    reapplyHighlightsTimer = setTimeout(reapplyKnownAnswerHighlights, 250);
  });
  observer.observe(observationTarget, { childList: true, subtree: true });
  observedFastTestRoots.add(rootEl);
}

function reapplyKnownAnswerHighlights() {
  const roots = getAccessibleFastTestRoots();
  roots.forEach(observeFastTestRoot);

  for (const { question, answerId } of knownCommunityAnswers.values()) {
    const selector = `[data-fiap-tools-question-id="${String(question.id)}"]`;
    if (roots.some((rootEl) => rootEl.querySelector?.(selector))) continue;

    for (const rootEl of roots) {
      if (highlightAnswerUsingQuestionContext(rootEl, question, answerId)) break;
    }
  }
}

async function highlightAnswerWhenReady(question, answerId) {
  const maxAttempts = 20;
  rememberKnownAnswer(question, answerId);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const roots = getAccessibleFastTestRoots();
    roots.forEach(observeFastTestRoot);
    for (const rootEl of roots) {
      if (
        highlightAnswerUsingQuestionContext(
          rootEl,
          question,
          answerId
        )
      ) {
        return true;
      }
    }

    if (attempt < maxAttempts) await delay(500);
  }

  console.log("[FIAP DEBUG] highlight timed out", {
    questionId: question.id,
    answerId,
  });
  return false;
}

function getAnswerExposedByFiap(question, isFinishedAttempt) {
  if (!Array.isArray(question.answers)) return null;

  const answerByFlag = question.answers.find(
    (answer) =>
      answer &&
      (answer.is_right === true ||
        answer.is_right === 1 ||
        answer.isRight === true)
  );
  if (answerByFlag) return answerByFlag.id;
  if (!isFinishedAttempt) return null;

  const selectedAnswer = question.answers.find(
    (answer) => answer && answer.selected === true
  );
  return selectedAnswer?.id ?? null;
}

async function saveCommunityAnswer(questionId, answerId) {
  await fetch("https://fiap.webart3.com/question/create", {
    headers: { "content-type": "text/plain;charset=UTF-8" },
    body: JSON.stringify({ question: questionId, answer: answerId }),
    method: "POST",
  });
}

async function getCommunityAnswers(questionIds) {
  if (questionIds.length === 0) return [];

  const response = await fetch("https://fiap.webart3.com/question/getmany", {
    headers: { "content-type": "text/plain;charset=UTF-8" },
    body: JSON.stringify({ ids: questionIds }),
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Community API returned HTTP ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

if (location.search.includes("id=") && location.search.includes("sesskey=")) {
  var id = location.search?.split("id=")?.[1]?.split("&")?.[0];
  var sesskey = location.search?.split("sesskey=")?.[1]?.split("&")?.[0];
  if (id && sesskey) {

    const fetchFastTestAnswers = async (shouldCreateProgressBar = true) => {

      let wrapper, progressBar;

      if (shouldCreateProgressBar) {
        const progressBarData = await createProgressBar();
        wrapper = progressBarData.wrapper;
        progressBar = progressBarData.progressBar;
      }

      await delay(5000);
      await fetch(
        `https://on.fiap.com.br/lib/ajax/service.php?sesskey=${sesskey}`,
        {
          headers: {
            accept: "*/*",
            "accept-language":
              "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
            "content-type": "application/json",
            "x-requested-with": "XMLHttpRequest",
          },
          referrer: `https://on.fiap.com.br`,
          body: JSON.stringify([
            {
              methodname:
                "local_quiz_get_informacoes_fast_test_by_conteudohtml",
              args: { cmid: id, start_new_attempt: false },
            },
          ]),
          method: "POST",
        }
      )
                .then((response) => response.json())
        .then(async (data) => {
          const fastTestResponse = Array.isArray(data) ? data[0] : null;
          const fastTestData =
            fastTestResponse && fastTestResponse.error === false
              ? fastTestResponse.data
              : null;

          if (!fastTestData || !Array.isArray(fastTestData.questions)) {
            showQuickToast(
              "Caso este documento tenha um fast-test, atualize a página."
            );
            return;
          }

          const isFinishedAttempt = fastTestData.state === "finished";
          const questions = fastTestData.questions;
          const totalItems = questions.length;
          let knownAnswerCount = 0;
          let highlightedAnswerCount = 0;
          let completedItems = 0;
          const advanceProgress = () => {
            completedItems++;
            if (progressBar && totalItems > 0) {
              updateProgressBar(
                progressBar,
                Math.round((completedItems / totalItems) * 100)
              );
            }
          };

          const resolvedQuestions = questions.map((question) => ({
            question,
            answerId: getAnswerExposedByFiap(question, isFinishedAttempt),
          }));
          const answersToSave = resolvedQuestions.filter(
            (item) => item.answerId != null
          );
          const questionsToLookup = resolvedQuestions.filter(
            (item) => item.answerId == null
          );

          await Promise.all(
            answersToSave.map(async ({ question, answerId }) => {
              try {
                await saveCommunityAnswer(question.id, answerId);
              } catch (error) {
                console.error("[FIAP DEBUG] failed to save community answer", {
                  questionId: question.id,
                  error,
                });
              } finally {
                advanceProgress();
              }
            })
          );

          let communityAnswers = [];
          try {
            communityAnswers = await getCommunityAnswers(
              questionsToLookup.map(({ question }) => question.id)
            );
          } catch (error) {
            console.error("[FIAP DEBUG] failed to load community answers", error);
          }
          const communityAnswerByQuestion = new Map(
            communityAnswers.map((item) => [String(item.question), item.answer])
          );

          const highlightResults = await Promise.all(
            questionsToLookup.map(async ({ question }) => {
              const answerId = communityAnswerByQuestion.get(String(question.id));
              try {
                if (answerId == null) return false;
                knownAnswerCount++;
                return await highlightAnswerWhenReady(question, answerId);
              } finally {
                advanceProgress();
              }
            })
          );
          highlightedAnswerCount = highlightResults.filter(Boolean).length;

          wrapper?.remove();

          if (knownAnswerCount > 0 && highlightedAnswerCount === 0) {
            showQuickToast(
              `FIAP Tools ${chrome.runtime.getManifest().version}: ` +
                `${knownAnswerCount} resposta(s) encontrada(s), mas a interface ` +
                "do fast-test não foi localizada. Abra o console para os detalhes.",
              9000
            );
          }

          const setFunctionOnFinishButton = (dom_target) => {
            if (!dom_target) {
              return;
            }

            const finishButton = dom_target.querySelector(
              [
                'button[class*="finish-button"]',
                'button[class*="finishButton"]',
                "button.on-button-finish-fast-test",
              ].join(", ")
            );

            if (
              finishButton &&
              !finishButton.hasAttribute("data-event-listener")
            ) {
              finishButton.setAttribute("data-event-listener", "true");
              finishButton.addEventListener("click", () => {
                fetchFastTestAnswers(false);
              });
            }
          };

          setFunctionOnFinishButton(document);

          let iframes = document.querySelectorAll("iframe");
          if (iframes.length > 0) {
            Array.from(iframes).map((iframe) => {
              setFunctionOnFinishButton(iframe.contentDocument);
            });
          }
        
        });

    };

    fetchFastTestAnswers();
  }
}
