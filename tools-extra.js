/**
 * QR Studio 扩展工具（纯前端）
 * URL 解析 · 时间戳 · 编码工具箱 · JSON Diff
 */
(function (global) {
    'use strict';

    const STORAGE = {
        lastModule: 'qr-studio-last-module',
        generateParams: 'qr-studio-generate-params'
    };


    function debounce(fn, wait) {
        let timer;
        return function debounced() {
            const ctx = this;
            const args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(ctx, args);
            }, wait);
        };
    }

    function toast(type, message) {
        if (typeof global.showToast === 'function') {
            global.showToast(type, message);
            return;
        }
        console[type === 'error' ? 'error' : 'log'](message);
    }

    function copyText(text) {
        if (!text) return Promise.reject(new Error('empty'));
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(ta);
            }
        });
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            return fallback;
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            /* ignore quota */
        }
    }

    /* ---------- URL 工具 ---------- */
    function initUrlTool() {
        const input = document.getElementById('urlToolInput');
        const parseBtn = document.getElementById('urlToolParse');
        const buildBtn = document.getElementById('urlToolBuild');
        const clearBtn = document.getElementById('urlToolClear');
        const copyBtn = document.getElementById('urlToolCopy');
        const baseOut = document.getElementById('urlToolBase');
        const hashOut = document.getElementById('urlToolHash');
        const kvBox = document.getElementById('urlToolKv');
        const meta = document.getElementById('urlToolMeta');
        if (!input || input.dataset.bound === '1') return;
        input.dataset.bound = '1';

        let lastParams = [];

        function renderMeta(urlObj) {
            if (!meta) return;
            meta.innerHTML = '';
            [
                ['协议', urlObj.protocol.replace(':', '')],
                ['主机', urlObj.host],
                ['路径', urlObj.pathname || '/'],
                ['查询参数', String(lastParams.length)]
            ].forEach(function (pair) {
                const chip = document.createElement('span');
                chip.className = 'extra-chip';
                chip.textContent = pair[0] + ' · ' + pair[1];
                meta.appendChild(chip);
            });
        }

        function renderKv(params) {
            lastParams = params;
            kvBox.innerHTML = '';
            if (!params.length) {
                kvBox.innerHTML = '<div class="extra-chip">暂无查询参数</div>';
                return;
            }
            params.forEach(function (item, index) {
                const row = document.createElement('div');
                row.className = 'extra-kv-row';
                row.innerHTML =
                    '<strong contenteditable="true" data-role="key" spellcheck="false">' + escapeHtml(item.key) + '</strong>' +
                    '<span contenteditable="true" data-role="value" spellcheck="false">' + escapeHtml(item.value) + '</span>' +
                    '<button type="button" data-copy="' + index + '">复制</button>';
                kvBox.appendChild(row);
            });
        }

        function collectParams() {
            return Array.prototype.map.call(kvBox.querySelectorAll('.extra-kv-row'), function (row) {
                const keyEl = row.querySelector('[data-role="key"]');
                const valEl = row.querySelector('[data-role="value"]');
                return {
                    key: (keyEl && keyEl.textContent.trim()) || '',
                    value: (valEl && valEl.textContent) || ''
                };
            }).filter(function (item) {
                return item.key;
            });
        }

        function parseUrl() {
            const raw = input.value.trim();
            if (!raw) {
                toast('error', '请先粘贴 URL');
                return;
            }
            try {
                const normalized = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw) ? raw : 'https://' + raw;
                const url = new URL(normalized);
                const params = [];
                url.searchParams.forEach(function (value, key) {
                    params.push({ key: key, value: value });
                });
                // 兼容 wechat hash 内参数：#wechat-redirect 后通常无 query，但 path 里可能含编码参数
                baseOut.value = url.origin + url.pathname;
                hashOut.value = url.hash || '';
                renderKv(params);
                renderMeta(url);
                toast('success', 'URL 已解析');
            } catch (err) {
                toast('error', 'URL 无法解析，请检查格式');
            }
        }

        function buildUrl() {
            try {
                const base = (baseOut.value || '').trim() || 'https://example.com/';
                const url = new URL(/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(base) ? base : 'https://' + base);
                url.search = '';
                collectParams().forEach(function (item) {
                    url.searchParams.append(item.key, item.value);
                });
                const hash = (hashOut.value || '').trim();
                url.hash = hash ? (hash.startsWith('#') ? hash.slice(1) : hash) : '';
                input.value = url.toString();
                toast('success', 'URL 已重新拼装');
            } catch (err) {
                toast('error', '拼装失败，请检查基础地址');
            }
        }

        parseBtn.addEventListener('click', parseUrl);
        buildBtn.addEventListener('click', buildUrl);
        clearBtn.addEventListener('click', function () {
            input.value = '';
            baseOut.value = '';
            hashOut.value = '';
            kvBox.innerHTML = '';
            meta.innerHTML = '';
        });
        copyBtn.addEventListener('click', function () {
            copyText(input.value).then(function () {
                toast('success', 'URL 已复制');
            }).catch(function () {
                toast('error', '复制失败');
            });
        });
        kvBox.addEventListener('click', function (event) {
            const btn = event.target.closest('[data-copy]');
            if (!btn) return;
            const row = btn.closest('.extra-kv-row');
            const key = row.querySelector('[data-role="key"]').textContent.trim();
            const value = row.querySelector('[data-role="value"]').textContent;
            copyText(key + '=' + value).then(function () {
                toast('success', '参数已复制');
            });
        });

        const fromGenerate = document.getElementById('generatedUrl');
        if (fromGenerate && fromGenerate.value && !input.value) {
            input.value = fromGenerate.value;
        }
    }

    /* ---------- 时间戳 ---------- */
    function initTimestampTool() {
        const input = document.getElementById('tsInput');
        const unit = document.getElementById('tsUnit');
        const convertBtn = document.getElementById('tsConvert');
        const nowBtn = document.getElementById('tsNow');
        const clearBtn = document.getElementById('tsClear');
        const outLocal = document.getElementById('tsLocal');
        const outUtc = document.getElementById('tsUtc');
        const outIso = document.getElementById('tsIso');
        const outSec = document.getElementById('tsSec');
        const outMs = document.getElementById('tsMs');
        const nowBox = document.getElementById('tsNowBox');
        if (!input || input.dataset.bound === '1') return;
        input.dataset.bound = '1';

        function formatDate(date) {
            const pad = function (n) { return String(n).padStart(2, '0'); };
            return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
                ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
        }

        function updateNow() {
            const now = new Date();
            nowBox.innerHTML =
                '<strong>当前时间</strong>' +
                escapeHtml(formatDate(now)) + ' · ' + now.getTime() + ' ms · ' + Math.floor(now.getTime() / 1000) + ' s';
        }

        function convert() {
            const raw = input.value.trim();
            if (!raw) {
                toast('error', '请输入时间戳或日期字符串');
                return;
            }
            let date;
            if (/^\d+$/.test(raw)) {
                let num = Number(raw);
                if (unit.value === 'auto') {
                    num = raw.length <= 10 ? num * 1000 : num;
                } else if (unit.value === 's') {
                    num = num * 1000;
                }
                date = new Date(num);
            } else {
                date = new Date(raw);
            }
            if (Number.isNaN(date.getTime())) {
                toast('error', '无法识别该时间');
                return;
            }
            outLocal.value = formatDate(date);
            outUtc.value = date.toUTCString();
            outIso.value = date.toISOString();
            outSec.value = String(Math.floor(date.getTime() / 1000));
            outMs.value = String(date.getTime());
            toast('success', '转换完成');
        }

        convertBtn.addEventListener('click', convert);
        nowBtn.addEventListener('click', function () {
            const now = Date.now();
            input.value = String(now);
            unit.value = 'ms';
            convert();
            updateNow();
        });
        clearBtn.addEventListener('click', function () {
            input.value = '';
            [outLocal, outUtc, outIso, outSec, outMs].forEach(function (el) { el.value = ''; });
        });
        document.querySelectorAll('[data-copy-ts]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const target = document.getElementById(btn.getAttribute('data-copy-ts'));
                if (!target || !target.value) return;
                copyText(target.value).then(function () {
                    toast('success', '已复制');
                });
            });
        });
        updateNow();
        setInterval(updateNow, 1000);
    }

    /* ---------- 编码工具箱 ---------- */
    function initEncodeTool() {
        const input = document.getElementById('encodeInput');
        const output = document.getElementById('encodeOutput');
        const tabs = document.getElementById('encodeModeTabs');
        const encodeBtn = document.getElementById('encodeDo');
        const decodeBtn = document.getElementById('encodeUndo');
        const swapBtn = document.getElementById('encodeSwap');
        const clearBtn = document.getElementById('encodeClear');
        const copyBtn = document.getElementById('encodeCopy');
        if (!input || input.dataset.bound === '1') return;
        input.dataset.bound = '1';

        let mode = 'base64';

        tabs.addEventListener('click', function (event) {
            const btn = event.target.closest('button[data-mode]');
            if (!btn) return;
            mode = btn.getAttribute('data-mode');
            Array.prototype.forEach.call(tabs.querySelectorAll('button'), function (el) {
                el.classList.toggle('is-active', el === btn);
            });
        });

        function run(direction) {
            const text = input.value;
            try {
                let result = '';
                if (mode === 'base64') {
                    result = direction === 'encode'
                        ? btoa(unescape(encodeURIComponent(text)))
                        : decodeURIComponent(escape(atob(text.trim())));
                } else if (mode === 'url') {
                    result = direction === 'encode' ? encodeURIComponent(text) : decodeURIComponent(text.trim());
                } else if (mode === 'unicode') {
                    if (direction === 'encode') {
                        result = Array.from(text).map(function (ch) {
                            const code = ch.codePointAt(0).toString(16).toUpperCase();
                            return '\\u' + code.padStart(4, '0');
                        }).join('');
                    } else {
                        result = text.replace(/\\u([0-9a-fA-F]{4,6})/g, function (_, hex) {
                            return String.fromCodePoint(parseInt(hex, 16));
                        });
                    }
                } else if (mode === 'html') {
                    result = direction === 'encode'
                        ? escapeHtml(text)
                        : text
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#39;/g, "'")
                            .replace(/&amp;/g, '&');
                }
                output.value = result;
                toast('success', direction === 'encode' ? '编码完成' : '解码完成');
            } catch (err) {
                toast('error', '处理失败，请检查输入内容');
            }
        }

        encodeBtn.addEventListener('click', function () { run('encode'); });
        decodeBtn.addEventListener('click', function () { run('decode'); });
        swapBtn.addEventListener('click', function () {
            const tmp = input.value;
            input.value = output.value;
            output.value = tmp;
        });
        clearBtn.addEventListener('click', function () {
            input.value = '';
            output.value = '';
        });
        copyBtn.addEventListener('click', function () {
            copyText(output.value).then(function () {
                toast('success', '结果已复制');
            });
        });
    }

    /* ---------- JSON / 文本 Diff ---------- */
    function lcsMatrix(a, b) {
        const m = a.length;
        const n = b.length;
        const dp = Array.from({ length: m + 1 }, function () {
            return new Array(n + 1).fill(0);
        });
        for (let i = m - 1; i >= 0; i--) {
            for (let j = n - 1; j >= 0; j--) {
                dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
        return dp;
    }

    function diffCharsHtml(oldText, newText, side) {
        const a = Array.from(oldText || '');
        const b = Array.from(newText || '');
        if (a.length * b.length > 40000) {
            return escapeHtml(side === 'left' ? oldText : newText);
        }
        const dp = lcsMatrix(a, b);
        const ops = [];
        let i = 0;
        let j = 0;
        while (i < a.length && j < b.length) {
            if (a[i] === b[j]) {
                ops.push({ type: 'same', ch: a[i] });
                i++;
                j++;
            } else if (dp[i + 1][j] >= dp[i][j + 1]) {
                ops.push({ type: 'del', ch: a[i++] });
            } else {
                ops.push({ type: 'add', ch: b[j++] });
            }
        }
        while (i < a.length) ops.push({ type: 'del', ch: a[i++] });
        while (j < b.length) ops.push({ type: 'add', ch: b[j++] });

        return ops.map(function (op) {
            const ch = escapeHtml(op.ch);
            if (side === 'left') {
                if (op.type === 'add') return '';
                if (op.type === 'del') return '<span class="d-inline-del">' + ch + '</span>';
                return ch;
            }
            if (op.type === 'del') return '';
            if (op.type === 'add') return '<span class="d-inline-add">' + ch + '</span>';
            return ch;
        }).join('');
    }

    function buildAlignedDiff(leftText, rightText) {
        const left = leftText.replace(/\r\n/g, '\n').split('\n');
        const right = rightText.replace(/\r\n/g, '\n').split('\n');
        if (left.length * right.length > 250000) {
            return { rows: [{ type: 'meta', text: '内容过大，已跳过逐行 Diff。请缩小对比范围。' }], stats: { add: 0, del: 0, chg: 0, same: 0 } };
        }
        const dp = lcsMatrix(left, right);
        const raw = [];
        let i = 0;
        let j = 0;
        let li = 1;
        let ri = 1;
        while (i < left.length && j < right.length) {
            if (left[i] === right[j]) {
                raw.push({ type: 'same', left: left[i], right: right[j], leftNo: li++, rightNo: ri++ });
                i++;
                j++;
            } else if (dp[i + 1][j] >= dp[i][j + 1]) {
                raw.push({ type: 'del', left: left[i], right: '', leftNo: li++, rightNo: null });
                i++;
            } else {
                raw.push({ type: 'add', left: '', right: right[j], leftNo: null, rightNo: ri++ });
                j++;
            }
        }
        while (i < left.length) {
            raw.push({ type: 'del', left: left[i++], right: '', leftNo: li++, rightNo: null });
        }
        while (j < right.length) {
            raw.push({ type: 'add', left: '', right: right[j++], leftNo: null, rightNo: ri++ });
        }

        // 相邻删除+新增合并为“修改”，便于字符级高亮
        const rows = [];
        for (let k = 0; k < raw.length; k++) {
            const cur = raw[k];
            const next = raw[k + 1];
            if (cur.type === 'del' && next && next.type === 'add') {
                rows.push({
                    type: 'chg',
                    left: cur.left,
                    right: next.right,
                    leftNo: cur.leftNo,
                    rightNo: next.rightNo
                });
                k++;
            } else {
                rows.push(cur);
            }
        }

        const stats = { add: 0, del: 0, chg: 0, same: 0 };
        rows.forEach(function (row) {
            if (row.type === 'add') stats.add++;
            else if (row.type === 'del') stats.del++;
            else if (row.type === 'chg') stats.chg++;
            else if (row.type === 'same') stats.same++;
        });
        return { rows: rows, stats: stats };
    }

    function renderDiffSide(rows, side) {
        return rows.map(function (row) {
            if (row.type === 'meta') {
                return '<div class="d-meta">' + escapeHtml(row.text) + '</div>';
            }
            const text = side === 'left' ? row.left : row.right;
            const lineNo = side === 'left' ? row.leftNo : row.rightNo;
            const empty = text === '' && row.type !== 'same' && !(row.type === 'chg');
            let cls = 'diff-row';
            let mark = ' ';
            let codeHtml = escapeHtml(text);

            if (row.type === 'same') {
                cls += ' is-same';
            } else if (row.type === 'del') {
                if (side === 'left') {
                    cls += ' is-del';
                    mark = '−';
                } else {
                    cls += ' is-empty';
                    mark = ' ';
                    codeHtml = '&nbsp;';
                }
            } else if (row.type === 'add') {
                if (side === 'right') {
                    cls += ' is-add';
                    mark = '+';
                } else {
                    cls += ' is-empty';
                    mark = ' ';
                    codeHtml = '&nbsp;';
                }
            } else if (row.type === 'chg') {
                cls += ' is-chg';
                mark = '±';
                codeHtml = diffCharsHtml(row.left, row.right, side) || '&nbsp;';
            }

            if (empty && row.type !== 'chg') {
                // already handled
            }

            return '<div class="' + cls + '">' +
                '<span class="d-ln">' + (lineNo == null ? '' : lineNo) + '</span>' +
                '<span class="d-mark">' + mark + '</span>' +
                '<span class="d-code">' + codeHtml + '</span>' +
                '</div>';
        }).join('');
    }

    function initDiffTool() {
        const left = document.getElementById('diffLeft');
        const right = document.getElementById('diffRight');
        const outLeft = document.getElementById('diffOutLeft');
        const outRight = document.getElementById('diffOutRight');
        const summary = document.getElementById('diffSummary');
        const runBtn = document.getElementById('diffRun');
        const prettyBtn = document.getElementById('diffPretty');
        const clearBtn = document.getElementById('diffClear');
        const swapBtn = document.getElementById('diffSwap');
        if (!left || left.dataset.bound === '1') return;
        left.dataset.bound = '1';

        function prettyMaybe(text) {
            const trimmed = text.trim();
            if (!trimmed) return text;
            try {
                return JSON.stringify(JSON.parse(trimmed), null, 2);
            } catch (e) {
                return text;
            }
        }

        function syncScroll(source, target) {
            target.scrollTop = source.scrollTop;
            target.scrollLeft = source.scrollLeft;
        }

        let syncing = false;
        outLeft.addEventListener('scroll', function () {
            if (syncing) return;
            syncing = true;
            syncScroll(outLeft, outRight);
            syncing = false;
        });
        outRight.addEventListener('scroll', function () {
            if (syncing) return;
            syncing = true;
            syncScroll(outRight, outLeft);
            syncing = false;
        });

        function runDiff() {
            const result = buildAlignedDiff(left.value, right.value);
            outLeft.innerHTML = renderDiffSide(result.rows, 'left');
            outRight.innerHTML = renderDiffSide(result.rows, 'right');
            const s = result.stats;
            summary.innerHTML =
                '<span class="diff-chip is-add">+ ' + s.add + ' 新增</span>' +
                '<span class="diff-chip is-del">− ' + s.del + ' 删除</span>' +
                '<span class="diff-chip is-chg">± ' + s.chg + ' 修改</span>' +
                '<span class="diff-chip">= ' + s.same + ' 相同</span>';
            toast('success', '对比完成：+' + s.add + ' / −' + s.del + ' / ±' + s.chg);
        }

        runBtn.addEventListener('click', runDiff);
        prettyBtn.addEventListener('click', function () {
            left.value = prettyMaybe(left.value);
            right.value = prettyMaybe(right.value);
            toast('info', '已尝试按 JSON 美化两侧内容');
        });
        clearBtn.addEventListener('click', function () {
            left.value = '';
            right.value = '';
            outLeft.innerHTML = '';
            outRight.innerHTML = '';
            summary.innerHTML = '<span class="diff-chip">等待对比</span>';
        });
        swapBtn.addEventListener('click', function () {
            const tmp = left.value;
            left.value = right.value;
            right.value = tmp;
        });
    }


    /* ---------- 生码表单记忆 + debounce ---------- */
    function restoreGenerateParams() {
        const saved = readJson(STORAGE.generateParams, null);
        if (!saved) return false;
        ['mcid', 'tableno', 'bustype', 'qrsize'].forEach(function (id) {
            const el = document.getElementById(id);
            if (el && saved[id] != null && saved[id] !== '') {
                el.value = saved[id];
                if (id === 'qrsize') {
                    const label = document.getElementById('qrsizeValue');
                    if (label) label.textContent = saved[id] + 'px';
                    if (typeof global.updateRangeProgress === 'function') {
                        global.updateRangeProgress(el);
                    }
                }
            }
        });
        const appid = document.getElementById('appid');
        if (appid && saved.appid) {
            const exists = Array.prototype.some.call(appid.options, function (opt) {
                return opt.value === saved.appid;
            });
            if (exists) appid.value = saved.appid;
        }
        return true;
    }

    function initGeneratePersistence() {
        const persist = debounce(function () {
            const payload = {
                appid: (document.getElementById('appid') || {}).value || '',
                mcid: (document.getElementById('mcid') || {}).value || '',
                tableno: (document.getElementById('tableno') || {}).value || '',
                bustype: (document.getElementById('bustype') || {}).value || '',
                qrsize: (document.getElementById('qrsize') || {}).value || '400'
            };
            writeJson(STORAGE.generateParams, payload);
        }, 300);

        ['appid', 'mcid', 'tableno', 'bustype', 'qrsize'].forEach(function (id) {
            const el = document.getElementById(id);
            if (!el || el.dataset.persistBound === '1') return;
            el.dataset.persistBound = '1';
            el.addEventListener('change', persist);
            el.addEventListener('input', persist);
        });

        // 下拉选项由主脚本异步填充，延迟恢复一次
        setTimeout(restoreGenerateParams, 700);
    }

    function wrapGenerateDebounce() {
        if (global.__qrDebounced) return true;
        if (typeof global.generateQRCode !== 'function') return false;
        global.__qrDebounced = true;
        const original = global.generateQRCode;
        const debounced = debounce(function () {
            original.apply(null, arguments);
        }, 280);
        global.generateQRCodeImmediate = original;
        global.generateQRCode = function () {
            debounced();
        };
        return true;
    }

    /* ---------- 模块注册 ---------- */
    const EXTRA_MODULES = [
        {
            id: 'url-tool',
            hash: '#url-tool',
            title: 'URL 解析拼装',
            description: '拆解查询参数、编辑后重新拼装，适合调试小程序链接。',
            kicker: 'URL WORKBENCH',
            navId: 'nav-url-tool',
            mobileNavId: 'mobile-nav-url-tool',
            moduleId: 'url-tool-module',
            init: initUrlTool
        },
        {
            id: 'timestamp',
            hash: '#timestamp',
            title: '时间戳转换',
            description: '秒/毫秒时间戳与本地时间、UTC、ISO 互转，测试日志更省事。',
            kicker: 'TIME LAB',
            navId: 'nav-timestamp',
            mobileNavId: 'mobile-nav-timestamp',
            moduleId: 'timestamp-module',
            init: initTimestampTool
        },
        {
            id: 'encode-tool',
            hash: '#encode-tool',
            title: '编码工具箱',
            description: 'Base64、URL、Unicode、HTML 实体本地编解码。',
            kicker: 'CODEC BOX',
            navId: 'nav-encode-tool',
            mobileNavId: 'mobile-nav-encode-tool',
            moduleId: 'encode-tool-module',
            init: initEncodeTool
        },
        {
            id: 'diff-tool',
            hash: '#diff-tool',
            title: '文本 / JSON Diff',
            description: '对比两段配置或接口返回，快速定位差异。',
            kicker: 'DIFF VIEW',
            navId: 'nav-diff-tool',
            mobileNavId: 'mobile-nav-diff-tool',
            moduleId: 'diff-tool-module',
            init: initDiffTool
        }
    ];

    const inited = {};

    function ensureInit(moduleDef) {
        if (!moduleDef || inited[moduleDef.id]) return;
        try {
            moduleDef.init();
            inited[moduleDef.id] = true;
        } catch (err) {
            console.error('初始化扩展工具失败:', moduleDef.id, err);
        }
    }

    function findExtraByHash(hash) {
        return EXTRA_MODULES.find(function (m) {
            return m.hash === hash;
        }) || null;
    }

    function boot() {
        if (!wrapGenerateDebounce()) {
            setTimeout(wrapGenerateDebounce, 0);
            setTimeout(wrapGenerateDebounce, 400);
        }
        initGeneratePersistence();
    }

    global.QRStudioExtra = {
        modules: EXTRA_MODULES,
        storageKeys: STORAGE,
        findByHash: findExtraByHash,
        ensureInit: ensureInit,
        restoreGenerateParams: restoreGenerateParams,
        debounce: debounce,
        boot: boot
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})(window);
