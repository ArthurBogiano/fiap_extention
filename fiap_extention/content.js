console.log("FIAP Tools iniciado!");

// verifica versionamento para ver se tem atualização
fetch("https://fiap.webart3.com/config/getversion").then((response) => {
  response.json().then((data) => {

    // manifest version
    var manifestData = chrome.runtime.getManifest();
    var manifestVersion = manifestData.version;

    if (data.version != manifestVersion) {

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

function range(start, end) {
  return Array(end - start)
    .fill(start)
    .map((x, idx) => x + idx);
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
  const root = containerEl.querySelector(".styles_questionContent__SQsLL") || containerEl;
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

function parseQuestionNumber(containerEl) {
  const title = containerEl.querySelector(".styles_questionTitle__Kc5sS")?.innerText || "";
  const m = title.match(/QUEST[AÃ]O\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

function normText(s) {
  return (s ?? "")
    .toString()
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim()
    .toLowerCase();
}

function buildDomAnswerMap(containerEl) {
  const map = new Map();
  const buttons = Array.from(containerEl.querySelectorAll('button[role="radio"]'));
  for (const btn of buttons) {
    const label = btn.querySelector(".styles_label___drsn")?.innerText || btn.innerText;
    const key = normText(label);
    if (!key) continue;

    if (map.has(key)) {
      const cur = map.get(key);
      map.set(key, Array.isArray(cur) ? [...cur, btn] : [cur, btn]);
    } else {
      map.set(key, btn);
    }
  }
  return map;
}

function highlightAnswerUsingQuestionContext(rootEl, questionFromApi, answerId, questionIndex) {
  if (!rootEl || !questionFromApi || answerId == null || questionIndex == null) return false;

  const containers = Array.from(rootEl.querySelectorAll(".styles_questionContainer__s193Y"));
  const containerEl = containers[questionIndex];
  if (!containerEl) {
    console.log("[FIAP DEBUG] container by index not found", {
      questionIndex,
      totalContainers: containers.length,
    });
    return false;
  }

  const answers = Array.isArray(questionFromApi.answers) ? questionFromApi.answers : [];
  const answerObj = answers.find((a) => String(a?.id) === String(answerId));
  if (!answerObj) {
    console.log("[FIAP DEBUG] answer id not found in questionFromApi.answers", {
      questionId: questionFromApi.id,
      answerId,
      availableAnswerIds: answers.map((a) => a?.id),
    });
    return false;
  }

  const domMap = buildDomAnswerMap(containerEl);
  const answerText = answerObj?.text ?? answerObj?.label ?? "";
  const mapped = domMap.get(normText(answerText));
  const buttonEl = Array.isArray(mapped) ? mapped[0] : mapped;

  if (!buttonEl) {
    console.log("[FIAP DEBUG] button not found by answer text in indexed container", {
      questionId: questionFromApi.id,
      answerId,
      answerText,
      questionIndex,
      domOptions: Array.from(domMap.keys()),
    });
    return false;
  }

  buttonEl.classList.add("on-fast-test-question-right");
  buttonEl.style.outline = "2px solid #22c55e";
  buttonEl.style.outlineOffset = "2px";
  buttonEl.style.borderRadius = "8px";
  console.log("[FIAP DEBUG] highlight applied by index+answerId strategy", {
    questionId: questionFromApi.id,
    answerId,
    questionIndex,
    answerText,
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

function highlightFromDataAttributes(rootEl, questionId, answerId) {
  const qId = String(questionId);
  const aId = String(answerId);

  const questionRoot = rootEl.querySelector(`[data-question-id='${qId}']`);
  if (!questionRoot) {
    console.log("[FIAP DEBUG] data-question-id root not found", { questionId: qId });
    return false;
  }

  const answerTarget = questionRoot.querySelector(`[data-answer-id='${aId}']`);
  if (!answerTarget) {
    console.log("[FIAP DEBUG] data-answer-id target not found", {
      questionId: qId,
      answerId: aId,
    });
    return false;
  }

  const buttonEl =
    answerTarget.closest('button[role="radio"]') ||
    answerTarget.querySelector('button[role="radio"]') ||
    answerTarget.closest("label") ||
    answerTarget;

  buttonEl.classList.add("on-fast-test-question-right");
  buttonEl.style.outline = "2px solid #22c55e";
  buttonEl.style.outlineOffset = "2px";
  buttonEl.style.borderRadius = "8px";
  console.log("[FIAP DEBUG] highlight applied by data-* fallback", {
    questionId: qId,
    answerId: aId,
    tagName: buttonEl.tagName,
  });
  return true;
}

function extractQuestionsWithAnswerButtonsFromRoot(rootEl) {
  const containers = Array.from(
    rootEl.querySelectorAll(".styles_questionContainer__s193Y")
  );
  console.log("[FIAP DEBUG] containers found", containers.length);

  return containers.map((containerEl) => {
    const number = parseQuestionNumber(containerEl);
    const statement =
      containerEl.querySelector(".styles_statement__wsmQt")?.innerText?.trim() || null;

    const qObj = getQuestionFromContainer(containerEl);
    const answersArr = qObj?.answers || qObj?.options || [];
    const domMap = buildDomAnswerMap(containerEl);

    const answers = Array.isArray(answersArr)
      ? answersArr.map((a) => {
          const text = a?.text ?? a?.label ?? "";
          const btn = domMap.get(normText(text)) ?? null;
          let buttonEl = btn;
          if (Array.isArray(btn)) buttonEl = btn[0] ?? null;
          const isCheckedDom = buttonEl
            ? buttonEl.getAttribute("aria-checked") === "true"
            : null;

          return {
            id: a?.id ?? null,
            text,
            isRight: a?.is_right ?? a?.isRight ?? null,
            buttonEl,
            isCheckedDom,
          };
        })
      : [];

    return {
      number,
      statement,
      questionId: qObj?.id ?? getQuestionIdFromDom(containerEl) ?? null,
      answers,
      containerEl,
    };
  });
}

function highlightAnswerByQuestionAndAnswerId(rootEl, questionId, answerId) {
  if (!rootEl || questionId == null || answerId == null) return false;

  const qId = String(questionId);
  const aId = String(answerId);

  const highlightedByDataAttributes = highlightFromDataAttributes(rootEl, qId, aId);
  if (highlightedByDataAttributes) return true;

  const questions = extractQuestionsWithAnswerButtonsFromRoot(rootEl);
  const question = questions.find((q) => String(q.questionId) === qId);
  if (!question) {
    console.log("[FIAP DEBUG] question not found", {
      questionId: qId,
      totalMappedQuestions: questions.length,
    });
    return false;
  }

  const answer = question.answers.find((a) => String(a.id) === aId);
  if (!answer?.buttonEl) {
    console.log("[FIAP DEBUG] answer/button not found", {
      questionId: qId,
      answerId: aId,
      mappedAnswers: question.answers.map((a) => ({
        id: a.id,
        text: a.text,
        hasButton: !!a.buttonEl,
      })),
    });
    return false;
  }

  answer.buttonEl.classList.add("on-fast-test-question-right");
  answer.buttonEl.style.outline = "2px solid #22c55e";
  answer.buttonEl.style.outlineOffset = "2px";
  answer.buttonEl.style.borderRadius = "8px";
  console.log("[FIAP DEBUG] highlight applied", {
    questionId: qId,
    answerId: aId,
    answerText: answer.text,
  });
  return true;
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
          var questions = fastTestData.questions;
          const totalItems = questions.length;
          await Promise.all(
            range(0, totalItems).map(async (index) => {
              const question = questions[index];
              let question_id = question.id;
              let answer = null;

              if (Array.isArray(question.answers)) {
                const answerByFlag = question.answers.find(
                  (a) => a && a.is_right === true
                );

                if (answerByFlag) {
                  answer = answerByFlag.id;
                } else if (isFinishedAttempt) {
                  // Finished attempts may expose only the selected option.
                  const selectedAnswer = question.answers.find(
                    (a) => a && a.selected === true
                  );
                  answer = selectedAnswer ? selectedAnswer.id : null;
                }
              }

              if (answer) {
                await fetch("https://fiap.webart3.com/question/create", {
                  headers: {
                    accept: "*/*",
                    "accept-language":
                      "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
                  },

                  body: JSON.stringify({
                    question: question_id,
                    answer: answer,
                  }),

                  method: "POST",
                });
              } else {
                await fetch("https://fiap.webart3.com/question/get", {
                  headers: {
                    accept: "*/*",
                    "accept-language":
                      "pt-BR,pt;q=0.9,en-CA;q=0.8,en;q=0.7,ru-RU;q=0.6,ru;q=0.5,en-US;q=0.4,es;q=0.3",
                  },

                  body: JSON.stringify({
                    id: question_id,
                  }),

                  method: "POST",
                })
                  .then((response) => response.json())
                  .then(async (data) => {
                    console.log("[FIAP DEBUG] /question/get response", {
                      questionId: question_id,
                      payload: data,
                    });
                    if (data.answer) {
                      await delay(4000);
                      let payload = (dom_target) => {
                        if (!dom_target) {
                          return;
                        }

                        const highlighted = highlightAnswerUsingQuestionContext(
                          dom_target,
                          question,
                          data.answer,
                          index
                        );
                        console.log("[FIAP DEBUG] highlight attempt result", {
                          questionId: question_id,
                          answerId: data.answer,
                          highlighted,
                          isIframeDocument: dom_target !== document,
                        });
                      };

                      payload(document);

                      let iframes = document.querySelectorAll("iframe");
                      if (iframes.length > 0) {
                        Array.from(iframes).map((iframe) => {
                          payload(iframe.contentDocument);
                        });
                      }
                    }
                });
            }
            const progress = ((index + 1) / totalItems) * 100;
            if (progressBar) {
              updateProgressBar(progressBar, Math.round(progress));
            }
          }))

          wrapper?.remove();

          const setFunctionOnFinishButton = (dom_target) => {
            if (!dom_target) {
              return;
            }

            const finishButton = dom_target.querySelector(
              "button.style_finishButton__tGVPI"
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

