const codeEl = document.getElementById("code")
const langEl = document.getElementById("language")
const analyzeBtn = document.getElementById("analyzeBtn")
const sampleBtn = document.getElementById("sampleBtn")
const themeToggle = document.getElementById("themeToggle")

const forCountEl = document.getElementById("forCount")
const whileCountEl = document.getElementById("whileCount")
const doWhileCountEl = document.getElementById("doWhileCount")
const nestDepthEl = document.getElementById("nestDepth")

const recStatusEl = document.getElementById("recursionStatus")
const recDetailsEl = document.getElementById("recursionDetails")

const bigOEl = document.getElementById("bigO")
const bigODetailsEl = document.getElementById("bigODetails")
const explEl = document.getElementById("explanation")
const complexityFillEl = document.getElementById("complexityFill")

const detectedLangEl = document.getElementById("detectedLang")
const resultsCard = document.getElementById("resultsCard")
const copyExplanationBtn = document.getElementById("copyExplanationBtn")

analyzeBtn.addEventListener("click", function ()
{
  runAnalysis(codeEl.value || "")
})

sampleBtn.addEventListener("click", function ()
{
  const lang = langEl.value
  let sample = ""

  if (lang === "java")
  {
    sample =
`int sumPairs(int[] arr, int n)
{
  int total = 0;
  for (int i = 0; i < n; i++)
  {
    for (int j = 0; j < n; j++)
    {
      total += arr[i] + arr[j];
    }
  }

  if (n == 0) return 0;
  return total + sumPairs(arr, n - 1);
}`
  }
  else
  {
    sample =
`int sumOfPairs(int arr[], int n)
{
  int total = 0;
  for (int i = 0; i < n; i++)
  {
    for (int j = 0; j < n; j++)
    {
      total += arr[i] + arr[j];
    }
  }

  if (n == 0) return 0;
  return total + sumOfPairs(arr, n - 1);
}`;
  }

  codeEl.value = sample
  runAnalysis(sample)
})

themeToggle.addEventListener("click", function ()
{
  const body = document.body
  if (body.classList.contains("theme-dark"))
  {
    body.classList.remove("theme-dark")
    body.classList.add("theme-light")
    themeToggle.textContent = "☀️ Light"
  }
  else
  {
    body.classList.remove("theme-light")
    body.classList.add("theme-dark")
    themeToggle.textContent = "🌙 Dark"
  }
})

// Copy explanation text
copyExplanationBtn.addEventListener("click", function ()
{
  const text = explEl.textContent.trim()
  if (!text)
  {
    return
  }

  if (navigator.clipboard && navigator.clipboard.writeText)
  {
    navigator.clipboard.writeText(text)
      .then(function ()
      {
        const original = copyExplanationBtn.textContent
        copyExplanationBtn.textContent = "✅ Copied"
        setTimeout(function ()
        {
          copyExplanationBtn.textContent = original
        }, 1200)
      })
      .catch(function ()
      {
        alert("Copy failed. You can copy manually.")
      })
  }
  else
  {
    alert("Clipboard API not supported in this browser.")
  }
})

function runAnalysis(code)
{
  const trimmed = code.trim()
  if (!trimmed)
  {
    resetUI()
    return
  }

  // show result card when we actually analyze
  resultsCard.classList.remove("hidden")

  const noComments = stripComments(trimmed)
  const detected = detectLanguage(noComments)
  updateLanguageUI(detected)

  const infinite = hasInfiniteLoop(noComments)
  const loops = detectLoops(noComments)
  const nest = estimateNestDepth(noComments)
  const rec = detectRecursion(noComments)

  forCountEl.textContent = String(loops.forCount)
  whileCountEl.textContent = String(loops.whileCount)
  doWhileCountEl.textContent = String(loops.doWhileCount)
  nestDepthEl.textContent = String(nest)

  updateRecursionUI(rec)

  if (infinite)
  {
    updateInfiniteUI(loops, rec)
    return
  }

  const comp = estimateComplexity(loops, rec, nest)
  updateComplexityUI(comp, loops, rec, nest)
}

function resetUI()
{
  forCountEl.textContent = "0"
  whileCountEl.textContent = "0"
  doWhileCountEl.textContent = "0"
  nestDepthEl.textContent = "0"

  bigOEl.textContent = "–"
  setBadge(bigOEl, "main")

  recStatusEl.textContent = "Not analyzed yet"
  setBadge(recStatusEl, "neutral")
  recDetailsEl.textContent = ""

  bigODetailsEl.textContent = "Run analysis to view how loops and recursion influence the runtime."
  explEl.textContent = "Paste some code and click “Analyze Code” to see a natural language explanation of the detected patterns and approximate time complexity."

  complexityFillEl.style.width = "0%"
  detectedLangEl.textContent = "–"

  // hide results until user analyzes
  resultsCard.classList.add("hidden")
}

function stripComments(src)
{
  let s = src
  s = s.replace(/\/\*[\s\S]*?\*\//g, "")
  s = s.replace(/\/\/.*$/gm, "")
  return s
}

/* ---------- Language Detection ---------- */

function detectLanguage(src)
{
  const text = src
  let scoreC = 0
  let scoreJava = 0

  if (/#include\s*</.test(text)) scoreC += 3
  if (/\bscanf\s*\(/.test(text)) scoreC += 2
  if (/\bprintf\s*\(/.test(text)) scoreC += 1
  if (/\bstd::/.test(text)) scoreC += 2
  if (/\busing\s+namespace\s+std\b/.test(text)) scoreC += 2

  if (/\bSystem\.out\.println\s*\(/.test(text)) scoreJava += 3
  if (/\bpublic\s+class\b/.test(text)) scoreJava += 3
  if (/\bpublic\s+static\s+void\s+main\b/.test(text)) scoreJava += 3
  if (/\bimport\s+java\./.test(text) || /\bpackage\s+[\w.]+;/.test(text)) scoreJava += 2

  const hasSemicolon = /;/.test(text)
  const hasBraces = /[{]/.test(text)

  let label = "Unknown / Generic C-like"

  if (scoreC === 0 && scoreJava === 0)
  {
    if (hasSemicolon || hasBraces)
    {
      label = "C / Java style (generic)"
    }
    else
    {
      label = "Unknown / Pseudo"
    }
  }
  else if (scoreJava > scoreC)
  {
    label = "Java"
  }
  else if (scoreC > scoreJava)
  {
    label = "C / C++"
  }
  else
  {
    label = "C / Java style (mixed)"
  }

  return {
    label: label,
    scoreC: scoreC,
    scoreJava: scoreJava
  }
}

function updateLanguageUI(info)
{
  detectedLangEl.textContent = info.label

  if (info.label === "Java")
  {
    langEl.value = "java"
  }
  else if (info.label === "C / C++" || info.label === "C / Java style (generic)")
  {
    langEl.value = "c"
  }
}

/* ---------- Loops / Recursion / Complexity ---------- */

function hasInfiniteLoop(src)
{
  if (/\bwhile\s*\(\s*(1|true)\s*\)/.test(src))
  {
    return true
  }
  if (/\bfor\s*\(\s*;\s*;\s*\)/.test(src))
  {
    return true
  }
  if (/do\s*\{[\s\S]*?\}\s*while\s*\(\s*(1|true)\s*\)\s*;?/.test(src))
  {
    return true
  }
  return false
}

function detectLoops(src)
{
  const noStr = src.replace(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g, "")

  const forMatches = noStr.match(/\bfor\s*\(/g) || []
  const whileMatches = noStr.match(/\bwhile\s*\(/g) || []
  const doMatches = noStr.match(/\bdo\s*\{/g) || []

  let whileCount = whileMatches.length
  const doWhileCount = doMatches.length
  if (whileCount >= doWhileCount)
  {
    whileCount = whileCount - doWhileCount
  }

  return {
    forCount: forMatches.length,
    whileCount: whileCount,
    doWhileCount: doWhileCount
  }
}

function detectRecursion(src)
{
  const text = src
  const defRegex = /(\w+)\s*\([^;{]*\)\s*\{/g
  const defs = []
  let m

  while ((m = defRegex.exec(text)) !== null)
  {
    const name = m[1]
    if (name === "if" || name === "for" || name === "while" || name === "switch" || name === "else")
    {
      continue
    }
    if (!defs.includes(name))
    {
      defs.push(name)
    }
  }

  const recFns = []
  for (let i = 0; i < defs.length; i++)
  {
    const name = defs[i]
    const callRegex = new RegExp("\\b" + name + "\\s*\\(", "g")
    const matches = text.match(callRegex)
    if (matches && matches.length > 1)
    {
      recFns.push(name)
    }
  }

  return {
    hasRecursion: recFns.length > 0,
    functions: defs,
    recursiveFns: recFns
  }
}

function estimateNestDepth(src)
{
  const noStr = src.replace(/"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g, "")
  const lines = noStr.split("\n")
  let depth = 0
  let maxDepth = 0

  for (let i = 0; i < lines.length; i++)
  {
    const line = lines[i]

    if (/\bfor\s*\(/.test(line) || /\bwhile\s*\(/.test(line) || /\bdo\s*\{/.test(line))
    {
      const openBraces = (line.match(/{/g) || []).length
      if (openBraces === 0)
      {
        depth++
        if (depth > maxDepth) maxDepth = depth
      }
    }

    const opens = (line.match(/{/g) || []).length
    const closes = (line.match(/}/g) || []).length
    depth += opens
    depth -= closes
    if (depth < 0) depth = 0

    if (depth > maxDepth) maxDepth = depth
  }

  if (maxDepth < 0) maxDepth = 0
  return maxDepth
}

function estimateComplexity(loops, rec, nest)
{
  let level = 0
  let label = "O(1)"
  let msg = "No loops detected. Runtime does not grow significantly with input size (constant time)."

  const totalLoops = loops.forCount + loops.whileCount + loops.doWhileCount

  if (totalLoops > 0 && nest <= 1)
  {
    level = 1
    label = "O(n)"
    msg = "Single-layer loops detected. Runtime typically grows roughly linearly with input size."
  }

  if (nest >= 2)
  {
    level = 2
    label = "O(n²)"
    msg = "Nested loops detected. Runtime likely grows quadratically with input size."
  }

  if (nest >= 3)
  {
    level = 3
    label = "O(n³) or higher"
    msg = "Deep nesting of loops suggests cubic or higher time complexity."
  }

  if (rec.hasRecursion)
  {
    label = label + " (with recursion)"
    msg += " Recursion is present. Exact complexity depends on the recurrence relation (e.g., T(n)=T(n-1)+O(1) → O(n), T(n)=2T(n-1)+O(1) → O(2ⁿ))."
  }

  return {
    label: label,
    message: msg,
    totalLoops: totalLoops,
    level: level
  }
}

function updateRecursionUI(rec)
{
  if (!rec.functions.length && !rec.hasRecursion)
  {
    recStatusEl.textContent = "No functions detected"
    setBadge(recStatusEl, "neutral")
    recDetailsEl.textContent = "Paste a full function definition to inspect recursion (e.g., int f(int n) { ... })."
    return
  }

  if (rec.hasRecursion)
  {
    recStatusEl.textContent = "Recursion detected"
    setBadge(recStatusEl, "bad")
    recDetailsEl.textContent = "Recursive functions: " + rec.recursiveFns.join(", ")
  }
  else
  {
    recStatusEl.textContent = "No recursion found"
    setBadge(recStatusEl, "good")
    if (rec.functions.length)
    {
      recDetailsEl.textContent = "Functions detected: " + rec.functions.join(", ")
    }
    else
    {
      recDetailsEl.textContent = ""
    }
  }
}

function updateInfiniteUI(loops, rec)
{
  bigOEl.textContent = "Non-terminating (infinite loop)"
  setBadge(bigOEl, "bad")
  bigODetailsEl.textContent = "An always-true loop condition (e.g., while(1), for(;;), or do-while(1)) was detected. The program does not terminate, so time complexity is unbounded rather than O(n), O(n²), etc."

  const totalLoops = loops.forCount + loops.whileCount + loops.doWhileCount
  let expl = "The analyzer found an infinite loop pattern. "

  if (totalLoops > 0)
  {
    expl += "Loop count summary — for: " + loops.forCount +
      ", while: " + loops.whileCount +
      ", do-while: " + loops.doWhileCount + ". "
  }

  if (rec.hasRecursion)
  {
    expl += "Recursion is also present in function(s): " + rec.recursiveFns.join(", ") + ". "
  }

  expl += "Since the loop condition never becomes false, the code keeps running indefinitely."

  explEl.textContent = expl
  complexityFillEl.style.width = "100%"

  // trigger shake animation on results card
  resultsCard.classList.remove("shake")
  void resultsCard.offsetWidth   // force reflow so animation can restart
  resultsCard.classList.add("shake")
}

function updateComplexityUI(comp, loops, rec, nest)
{
  bigOEl.textContent = comp.label

  if (comp.level === 0)
  {
    setBadge(bigOEl, "main")
  }
  else if (comp.level === 1)
  {
    setBadge(bigOEl, "good")
  }
  else if (comp.level === 2)
  {
    setBadge(bigOEl, "warn")
  }
  else
  {
    setBadge(bigOEl, "bad")
  }

  bigODetailsEl.textContent = comp.message

  let expl = ""

  if (comp.totalLoops === 0 && !rec.hasRecursion)
  {
    expl = "No loops or recursion were detected, so the runtime appears constant with respect to input size. Any extra cost is from simple statements only."
  }
  else
  {
    expl = "The tool found " + comp.totalLoops + " loop(s)"
    expl += " (for: " + loops.forCount + ", while: " + loops.whileCount + ", do-while: " + loops.doWhileCount + "). "

    if (nest > 1)
    {
      expl += "A nesting depth of about " + nest + " suggests that some loops run inside others, which increases how fast runtime grows with input size. "
    }
    else if (nest === 1)
    {
      expl += "The loops appear mostly single-layer, which usually yields linear growth with input size. "
    }

    if (rec.hasRecursion)
    {
      expl += "Recursion was detected in: " + rec.recursiveFns.join(", ") +
        ". The exact complexity depends on how many recursive calls are made and how the arguments shrink at each step."
    }
  }

  explEl.textContent = expl

  const maxLevel = 3
  const clamped = Math.max(0, Math.min(maxLevel, comp.level))
  const width = ((clamped + 1) / (maxLevel + 1)) * 100
  complexityFillEl.style.width = width + "%"
}

function setBadge(el, type)
{
  el.classList.remove("badge-main", "badge-neutral", "badge-good", "badge-warn", "badge-bad")
  el.classList.add("badge")
  if (type === "main") el.classList.add("badge-main")
  if (type === "neutral") el.classList.add("badge-neutral")
  if (type === "good") el.classList.add("badge-good")
  if (type === "warn") el.classList.add("badge-warn")
  if (type === "bad") el.classList.add("badge-bad")
}

resetUI()
