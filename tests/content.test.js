const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function decodeFixtureHtml(value) {
  const entities = {
    amp: "&",
    apos: "'",
    ccedil: "ç",
    ecirc: "ê",
    eacute: "é",
    iacute: "í",
    nbsp: "\u00a0",
    otilde: "õ",
    quot: '"',
  };

  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&([a-z]+);/gi, (match, name) => entities[name.toLowerCase()] ?? match);
}

function makeDecoderElement() {
  return {
    textContent: "",
    set innerHTML(value) {
      this.textContent = decodeFixtureHtml(value);
    },
  };
}

function makeButton(text) {
  const attributes = new Map([["role", "radio"]]);
  const classes = new Set();
  const styles = new Map();
  const label = { innerText: text, textContent: text };

  return {
    innerText: text,
    textContent: text,
    classList: { add: (name) => classes.add(name) },
    style: {
      setProperty: (name, value, priority) =>
        styles.set(name, { value, priority }),
    },
    querySelector(selector) {
      return selector.includes("label") || selector.includes("answer-text")
        ? label
        : null;
    },
    querySelectorAll() {
      return [];
    },
    getAttribute: (name) => attributes.get(name) ?? null,
    setAttribute: (name, value) => attributes.set(name, String(value)),
    closest: () => null,
    testState: { attributes, classes, styles },
  };
}

function makeQuestion(number, statement, answerTexts) {
  const buttons = answerTexts.map(makeButton);
  const title = {
    innerText: `QUESTÃO ${number}`,
    textContent: `QUESTÃO ${number}`,
  };
  const statementElement = { innerText: statement, textContent: statement };

  return {
    innerText: `${title.innerText} ${statement} ${answerTexts.join(" ")}`,
    textContent: `${title.textContent} ${statement} ${answerTexts.join(" ")}`,
    buttons,
    querySelector(selector) {
      if (selector === ".styles_questionContent__SQsLL") return null;
      if (selector.includes("questionTitle")) return title;
      if (selector.includes("statement")) return statementElement;
      if (selector.includes('[role="radio"]')) return buttons[0] ?? null;
      return null;
    },
    querySelectorAll(selector) {
      return selector.includes('[role="radio"]') ? buttons : [];
    },
    getAttribute: () => null,
    closest: () => null,
  };
}

function makeRoot(questions) {
  return {
    querySelectorAll(selector) {
      if (selector.includes("questionContainer")) return questions;
      return [];
    },
  };
}

function makeGlobalTextNode(text, parentElement, interactive = false) {
  const attributes = new Map();
  const classes = new Set();
  const styles = new Map();
  const node = {
    innerText: text,
    textContent: text,
    parentElement,
    classList: { add: (name) => classes.add(name) },
    style: {
      setProperty: (name, value, priority) =>
        styles.set(name, { value, priority }),
    },
    contains(other) {
      let current = other;
      while (current) {
        if (current === node) return true;
        current = current.parentElement;
      }
      return false;
    },
    closest() {
      if (interactive) return node;
      return parentElement?.closest?.() ?? null;
    },
    setAttribute: (name, value) => attributes.set(name, String(value)),
    testState: { attributes, classes, styles },
  };
  return node;
}

function makeGlobalTextRoot(questionFixtures) {
  const root = { parentElement: null };
  const candidates = [];

  for (const fixture of questionFixtures) {
    const questionBlock = {
      parentElement: root,
      closest: () => null,
    };
    candidates.push(
      makeGlobalTextNode(fixture.statement, questionBlock),
      ...fixture.answers.map((answer) =>
        makeGlobalTextNode(answer, questionBlock, true)
      )
    );
  }

  root.querySelectorAll = (selector) => {
    if (selector.includes("questionContainer")) return [];
    if (selector === "[data-question-id]") return [];
    return candidates;
  };
  return { root, candidates };
}

function loadContentScript() {
  const document = {
    createElement: makeDecoderElement,
    querySelectorAll: () => [],
  };
  const context = vm.createContext({
    chrome: {
      runtime: { getManifest: () => ({ version: "1.5.4" }) },
      storage: { local: { get: async () => ({ showIndicators: false }) } },
    },
    console: { log() {}, error() {} },
    document,
    fetch: async () => ({ json: async () => ({ version: "1.5.4" }) }),
    location: { search: "" },
    Map,
    Promise,
    Set,
    String,
  });
  const contentPath = path.join(__dirname, "..", "fiap_extention", "content.js");
  vm.runInContext(fs.readFileSync(contentPath, "utf8"), context, {
    filename: contentPath,
  });
  return context;
}

test("highlights by question and answer text when API order differs from DOM", () => {
  const context = loadContentScript();
  const domQuestions = [
    makeQuestion(1, "Primeira pergunta", ["Resposta 1"]),
    makeQuestion(2, "Segunda pergunta", ["Resposta 2"]),
    makeQuestion(3, "Qual a principal vantagem dos modelos híbridos?", [
      "Não precisarem de ajuste.",
      "Melhor equilíbrio entre eficiência e desempenho.",
    ]),
  ];
  const apiQuestion = {
    id: 4728992,
    name: "Questão 3",
    text: "Qual a principal vantagem dos modelos h&iacute;bridos?",
    answers: [
      { id: 434424, text: "N&atilde;o precisarem de ajuste." },
      {
        id: 434421,
        text: "Melhor equil&iacute;brio entre efici&ecirc;ncia e desempenho.",
      },
    ],
  };

  context.testRoot = makeRoot(domQuestions);
  context.testQuestion = apiQuestion;
  const highlighted = vm.runInContext(
    "highlightAnswerUsingQuestionContext(testRoot, testQuestion, '434421')",
    context
  );

  assert.equal(highlighted, true);
  assert.equal(
    domQuestions[2].buttons[1].testState.attributes.get(
      "data-fiap-tools-correct-answer"
    ),
    "true"
  );
  assert.equal(
    domQuestions[2].buttons[1].testState.classes.has(
      "fiap-tools-correct-answer"
    ),
    true
  );
  assert.equal(
    domQuestions[1].buttons[0].testState.attributes.has(
      "data-fiap-tools-correct-answer"
    ),
    false
  );
});

test("matches HTML entities from the FIAP response to rendered Unicode text", () => {
  const context = loadContentScript();
  const domQuestion = makeQuestion(
    1,
    "O que é aprendizado autossupervisionado em Vision Transformers?",
    ["Aprender representações usando dados sem rótulos explícitos."]
  );
  context.testRoot = makeRoot([domQuestion]);
  context.testQuestion = {
    id: 4728990,
    name: "Questão 1",
    text: "O que &eacute; aprendizado autossupervisionado em Vision Transformers?",
    answers: [
      {
        id: 434412,
        text: "Aprender representa&ccedil;&otilde;es usando dados sem rótulos explícitos.",
      },
    ],
  };

  const highlighted = vm.runInContext(
    "highlightAnswerUsingQuestionContext(testRoot, testQuestion, 434412)",
    context
  );

  assert.equal(highlighted, true);
  assert.equal(
    domQuestion.buttons[0].testState.classes.has("fiap-tools-correct-answer"),
    true
  );
});

test("finds the right answer by visible text without containers or radio roles", () => {
  const context = loadContentScript();
  const globalFixture = makeGlobalTextRoot([
    {
      statement: "Uma pergunta diferente",
      answers: ["Resposta repetida", "Outra resposta"],
    },
    {
      statement: "Pergunta da API sem marcadores no DOM",
      answers: ["Resposta repetida", "Resposta correta"],
    },
  ]);
  context.testRoot = globalFixture.root;
  context.testQuestion = {
    id: 999,
    name: "Questão 2",
    text: "Pergunta da API sem marcadores no DOM",
    answers: [{ id: 123, text: "Resposta repetida" }],
  };

  const highlighted = vm.runInContext(
    "highlightAnswerUsingQuestionContext(testRoot, testQuestion, 123)",
    context
  );

  assert.equal(highlighted, true);
  assert.equal(
    globalFixture.candidates[4].testState.attributes.get(
      "data-fiap-tools-correct-answer"
    ),
    "true"
  );
  assert.equal(
    globalFixture.candidates[1].testState.attributes.has(
      "data-fiap-tools-correct-answer"
    ),
    false
  );
});

test("promotes an inner option element to the complete radio button", () => {
  const context = loadContentScript();
  const button = { kind: "button" };
  const optionContent = { kind: "option-content" };
  context.innerOption = {
    parentElement: optionContent,
    closest(selector) {
      return selector.includes("button") ? button : optionContent;
    },
  };

  const target = vm.runInContext(
    "getAnswerHighlightTarget(innerOption)",
    context
  );
  assert.equal(target, button);
});

test("loads all community answers in one batch request", async () => {
  const context = loadContentScript();
  let capturedRequest = null;
  context.fetch = async (url, options) => {
    capturedRequest = { url, options };
    return {
      ok: true,
      json: async () => [
        { question: "4728990", answer: "434412" },
        { question: "4728992", answer: "434421" },
      ],
    };
  };
  context.testIds = [4728990, 4728992];

  const result = await vm.runInContext(
    "getCommunityAnswers(testIds)",
    context
  );

  assert.equal(result.length, 2);
  assert.equal(
    capturedRequest.url,
    "https://fiap.webart3.com/question/getmany"
  );
  assert.deepEqual(JSON.parse(capturedRequest.options.body), {
    ids: [4728990, 4728992],
  });
});
