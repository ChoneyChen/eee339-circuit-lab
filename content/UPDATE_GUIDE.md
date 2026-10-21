# 课程持续更新指南

## 文件安排

- `js/lessons-early.js`：第 1–7 讲。
- `js/lessons-late.js`：第 8–15 讲，包含第 10 讲缺失占位。
- `js/lessons-custom.js`：后续更新入口。同 ID 的对象覆盖原讲；新 ID 增加新讲。
- `content/audit-early.md`、`content/audit-late.md`：原课件逐页阅读与知识点覆盖审计。
- `content/source-text/`：本地阅读中间材料，已加入 `.gitignore`，不会上传。

网站将 customLessons 按 ID 与现有讲次合并，自动生成目录、统计、搜索、题库和课程导航。增加讲次不需要重写前端。保持已有 section/exercise ID 稳定可保留对应阅读记录。

## 补充第 10 讲

先完整阅读 `Lecture10.pdf`。不要根据前后课程猜测缺失内容。把完整课程对象写入 `customLessons`，设置 `id:10` 和 `available:true`。填入原始物理页码和实际学习目标。建议每讲至少六个详细知识单元、六道相关练习，并覆盖每一页有教学意义的内容。第 12–13 与 14–15 讲目前的拆分是学习单元拆分，不声称原件有独立课次边界。

## 代码与练习连学规则

主界面按 `code → brief → walkthrough → 就地练习` 展示；不展示原来的长段落 `body`。`body` 保留用于来源存档和搜索。

- 每节必须有真实 Verilog 代码；时序模型、仿真 testbench 和 RTL 片段要明确其范围，不能把数学伪代码标成 Verilog。
- `brief` 用一句话交代代码目标；`walkthrough` 为 2–4 条逐行说明，`code` 字段必须是示例代码中的精确非空子串，界面据此给出行号。
- `experiment` 给出一个具体输入、时钟或代码改动，以及准确的预期行为。
- 当前节的 `exercises` 按 `sectionId` 直接嵌在讲解下方；使用稳定 ID，共享原题库的草稿、作答记录和错题状态。
- 中英术语由 `js/terminology.js` 统一标注，手工已有英文会保留；不要把注释翻译函数用于可执行代码。

## 课程对象

```js
{
  id: 10,
  available: true,
  title: '根据原件填写',
  subtitle: '一句话概述',
  summary: '本讲内容与学习路线',
  sourceFile: 'Lecture10.pdf',
  sourcePages: 20,
  objectives: ['可检验的学习目标'],
  sections: [{
    id: 'l10-s1', title: '具体知识点', pages: '3–5',
    body: ['原课件背景存档', '详细推导存档', '硬件映射存档'],
    brief: '这段代码实现什么，用一句话说明',
    walkthrough: [
      {code:'来自下方 code 的精确子串', explanation:'对应这行的简短解释，重要术语附英文'},
      {code:'另一条精确代码子串', explanation:'说明输入变化和硬件行为'}
    ],
    experiment: {action:'具体修改一处代码或输入', expected:'预期输出或行为'},
    code: '正确的 Verilog 示例',
    hardware: '实际描述哪些门、连线或存储元件',
    pitfalls: ['可复现的常见错误'],
    check: {
      question: '检验理解的问题', options: ['答案A','答案B'],
      answer: 0, explanation: '为什么是 A'
    }
  }],
  exercises: []
}
```

## 习题格式

所有习题必须有稳定 `id`、`title`、`sectionId`、`prompt`、`difficulty`（1–3）、`explanation`、`hints`。

- `type:'choice'`：`options` 数组和从零开始的 `answer` 索引。
- `type:'fill'`：`starter` 中用 `___` 标出空白；`accepted` 列出可接受的关键词/代码片段，`solution` 是完整讲解答案。多个空若输入同一运算符，要在题意明确说明。判定比较词法 token，忽略 token 之间的空白和最后一个分号，保持大小写与运算符语义；`end module` 不会误判为 `endmodule`，`< =` 不会误判为 `<=`。
- `type:'code'` 或 `type:'debug'`：目前可自动执行的题设置 `engine:'comb'`；提供 `starter`、`solution`、`inputs`、`outputs`、`vectors`。

```js
{
 id:'l10-e1',title:'双输入异或',sectionId:'l10-s1',type:'code',
 difficulty:1,engine:'comb',prompt:'实现 y=a^b',
 starter:'module top(input a,b,output y);\n assign y=0;\nendmodule',
 solution:'module top(input a,b,output y);\n assign y=a^b;\nendmodule',
 inputs:[{name:'a',width:1},{name:'b',width:1}],
 outputs:[{name:'y',width:1}],
 vectors:[
  {inputs:{a:0,b:0},expected:{y:0}},
  {inputs:{a:0,b:1},expected:{y:1}},
  {inputs:{a:1,b:0},expected:{y:1}},
  {inputs:{a:1,b:1},expected:{y:0}}
 ],
 explanation:'不同为1，相同为0。',hints:['先列出四行真值表。']
}
```

不要仅靠代码字符串与参考答案相同判断代码题。新代码题应覆盖所有小输入域，或明确设计边界测试、互斥选择、最大值和溢出场景。修改运算符后应出现反例。参考答案通过不表示测试已证明所有行为。

## 仿真边界

浏览器中的 `simulator.js` 是受限教学解释器，采用词法分析、语法树和 BigInt 二态计算，不使用 `eval`、`new Function`，不向服务器发送代码。

支持单模块、ANSI/非 ANSI 端口、wire、连续赋值、组合运算、位宽截断、条件选择、连接、选择与切片。具体支持与资源上限以引擎文件头和测试为准。`always` / `initial` / `signed` / X/Z / 实例层次 / 延迟不在执行范围内，必须明确提示。四态、时序、FSM 等课堂语义由中文精读、概念题和只读固定模型说明；不能伪装成任意 HDL 执行。

要增加完整时序代码题，应先引入真正的 Verilog 编译/仿真环境和 testbench，或严格定义并验证新的解析子集，不能只凭正则或答案匹配声称仿真通过。

## 检查与发布

```sh
npm test
npm run check
npm run dev
```

在浏览器检查阅读、练习错误/正确两种反馈、输入切换、时序单步与手机布局。确认没有把原始 PDF、提取全文、个人学习记录或凭据加入 Git。

```sh
git add .
git commit -m "Update course content"
git push origin main
```

GitHub Pages 配置为从 `main` 根目录发布。推送后等待 Pages 构建完成，检查公开地址。原 PDF 可通过网站的「连接本地 PDF」按钮临时绑定到文件名，只有本次浏览器会话可用，不会上传。
