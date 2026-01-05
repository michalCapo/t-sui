import crypto from "node:crypto";
import { IncomingMessage } from "node:http";

import ui from "./ui";
import { BodyItem, Callable, Context } from "./ui.server";

const defaultCaptchaLength = 6;
const defaultCaptchaLifetime = 5 * 60 * 1000;
const cleanupGracePeriod = 10 * 60 * 1000;
const defaultCaptchaAttempts = 3;

interface CaptchaSession {
    text: string;
    createdAt: number;
    attempts: number;
    solved: boolean;
    expiresAt: number;
    maxAttempts: number;
}

interface CaptchaValidationResult {
    ok: boolean;
    error?: Error;
}

const captchaSessions = new Map<string, CaptchaSession>();

function renderCaptchaError(message: string): string {
    return ui.div("text-red-600 bg-red-50 border border-red-200 rounded p-3")(
        ui.span("font-semibold block mb-1")("CAPTCHA Error"),
        ui.span("text-sm")("" + message),
    );
}

function escapeJS(value: string): string {
    let out = String(value || "");
    out = out.replace(/\\/g, "\\\\");
    out = out.replace(/'/g, "\\'");
    out = out.replace(/\r/g, "\\r");
    out = out.replace(/\n/g, "\\n");
    out = out.replace(/\u2028/g, "\\u2028");
    out = out.replace(/\u2029/g, "\\u2029");
    out = out.replace(/<\//g, "<\\/");
    return out;
}

function generateSecureID(prefix: string): string {
    const buf = crypto.randomBytes(8);
    return prefix + buf.toString("hex");
}

function generateSecureCaptchaText(length: number): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const safeLength = length > 0 ? length : defaultCaptchaLength;
    const bytes = crypto.randomBytes(safeLength);
    let result = "";
    for (let i = 0; i < safeLength; i++) {
        const idx = bytes[i] % chars.length;
        result += chars.charAt(idx);
    }
    return result;
}

function cleanupExpiredCaptchaSessions(): void {
    const now = Date.now();
    const entries = captchaSessions.entries();
    while (true) {
        const next = entries.next();
        if (next.done) {
            break;
        }
        const key = next.value[0];
        const session = next.value[1];
        if (!session) {
            captchaSessions.delete(key);
            continue;
        }
        if (sessionExpired(session, now) || now - session.createdAt > cleanupGracePeriod) {
            captchaSessions.delete(key);
        }
    }
}

function createCaptchaSession(
    sessionID: string,
    length: number,
    lifetime: number,
    attemptLimit: number,
): CaptchaSession {
    cleanupExpiredCaptchaSessions();
    const captchaText = generateSecureCaptchaText(length);
    const lifetimeValue = lifetime > 0 ? lifetime : defaultCaptchaLifetime;
    const attemptValue = attemptLimit > 0 ? attemptLimit : defaultCaptchaAttempts;
    const now = Date.now();
    const session: CaptchaSession = {
        text: captchaText,
        createdAt: now,
        attempts: 0,
        solved: false,
        expiresAt: now + lifetimeValue,
        maxAttempts: attemptValue,
    };
    captchaSessions.set(sessionID, session);
    return session;
}

function sessionExpired(session: CaptchaSession, now: number): boolean {
    if (!session) {
        return true;
    }
    if (session.expiresAt > 0) {
        return now > session.expiresAt;
    }
    return now - session.createdAt > defaultCaptchaLifetime;
}

function validateCaptcha(sessionID: string, arrangement: string): CaptchaValidationResult {
    if (!sessionID) {
        return { ok: false, error: new Error("CAPTCHA session missing") };
    }
    const session = captchaSessions.get(sessionID);
    if (!session) {
        return { ok: false, error: new Error("CAPTCHA session not found") };
    }
    const now = Date.now();
    if (sessionExpired(session, now)) {
        captchaSessions.delete(sessionID);
        return { ok: false, error: new Error("CAPTCHA session expired") };
    }
    const limit = session.maxAttempts > 0 ? session.maxAttempts : defaultCaptchaAttempts;
    session.attempts += 1;
    if (session.attempts > limit) {
        captchaSessions.delete(sessionID);
        return { ok: false, error: new Error("too many CAPTCHA attempts") };
    }
    if (session.solved) {
        return { ok: true };
    }
    if (String(arrangement || "") === session.text) {
        session.solved = true;
        return { ok: true };
    }
    return { ok: false };
}

function shuffleStringSecure(input: string): string {
    const runes = Array.from(String(input || ""));
    const length = runes.length;
    if (length <= 1) {
        return input;
    }
    for (let i = length - 1; i > 0; i--) {
        const j = secureRandomIndex(i + 1);
        const tmp = runes[i];
        runes[i] = runes[j];
        runes[j] = tmp;
    }
    const shuffled = runes.join("");
    if (shuffled === input && hasMultipleUniqueRunes(runes)) {
        const last = length - 1;
        const tmp2 = runes[0];
        runes[0] = runes[last];
        runes[last] = tmp2;
        if (runes.join("") === input && length > 3) {
            const tmp3 = runes[1];
            runes[1] = runes[length - 2];
            runes[length - 2] = tmp3;
        }
    }
    return runes.join("");
}

function secureRandomIndex(bound: number): number {
    if (bound <= 0) {
        return 0;
    }
    try {
        return crypto.randomInt(bound);
    } catch (_) {
        const now = Date.now();
        const positive = now < 0 ? -now : now;
        return positive % bound;
    }
}

function hasMultipleUniqueRunes(runes: string[]): boolean {
    if (!runes || runes.length <= 1) {
        return false;
    }
    const seen = new Set<string>();
    for (let i = 0; i < runes.length; i++) {
        seen.add(runes[i]);
        if (seen.size > 1) {
            return true;
        }
    }
    return false;
}

function findBodyValue(items: BodyItem[] | undefined, name: string): string {
    if (!items || !name) {
        return "";
    }
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item) {
            continue;
        }
        if (item.name === name) {
            return String(item.value || "");
        }
    }
    return "";
}

export interface Captcha {
    SessionField(name: string): Captcha;
    ArrangementField(name: string): Captcha;
    ClientVerifiedField(name: string): Captcha;
    Count(n: number): Captcha;
    Lifetime(ms: number): Captcha;
    Attempts(limit: number): Captcha;
    SessionFieldName(): string;
    ArrangementFieldName(): string;
    ClientVerifiedFieldName(): string;
    Render(ctx?: Context): string;
    ValidateValues(sessionID: string, arrangement: string): CaptchaValidationResult;
    Validate(sessionID: string, arrangement: string): CaptchaValidationResult;
    // ValidateRequest(req: IncomingMessage): CaptchaValidationResult;
}

export function Captcha(onValidated: Callable): Captcha {
    const state = {
        sessionFieldName: "captcha_session",
        arrangementFieldName: "captcha_arrangement",
        clientVerifiedFieldName: "captcha_client_verified",
        characterCount: 4,
        sessionLifetime: defaultCaptchaLifetime,
        attemptLimit: defaultCaptchaAttempts,
        onValidated: onValidated,
    };

    function sessionField(name: string): Captcha {
        if (name) {
            state.sessionFieldName = name;
        }
        return component;
    }

    function arrangementField(name: string): Captcha {
        if (name) {
            state.arrangementFieldName = name;
        }
        return component;
    }

    function clientVerifiedField(name: string): Captcha {
        if (name) {
            state.clientVerifiedFieldName = name;
        }
        return component;
    }

    function count(n: number): Captcha {
        if (n > 0) {
            state.characterCount = n;
        }
        return component;
    }

    function lifetime(ms: number): Captcha {
        if (ms > 0) {
            state.sessionLifetime = ms;
        }
        return component;
    }

    function attempts(limit: number): Captcha {
        if (limit > 0) {
            state.attemptLimit = limit;
        }
        return component;
    }

    function sessionFieldName(): string {
        if (!state.sessionFieldName) {
            return "captcha_session";
        }
        return state.sessionFieldName;
    }

    function arrangementFieldName(): string {
        if (!state.arrangementFieldName) {
            return "captcha_arrangement";
        }
        return state.arrangementFieldName;
    }

    function clientVerifiedFieldName(): string {
        if (!state.clientVerifiedFieldName) {
            return "captcha_client_verified";
        }
        return state.clientVerifiedFieldName;
    }

    function characterCountValue(): number {
        if (state.characterCount <= 0) {
            return 5;
        }
        return state.characterCount;
    }

    function lifetimeValue(): number {
        if (state.sessionLifetime <= 0) {
            return defaultCaptchaLifetime;
        }
        return state.sessionLifetime;
    }

    function attemptLimitValue(): number {
        if (state.attemptLimit <= 0) {
            return defaultCaptchaAttempts;
        }
        return state.attemptLimit;
    }

    function render(ctx?: Context): string {
        let sessionID: string;
        try {
            sessionID = generateSecureID("captcha_session_");
        } catch (_) {
            return renderCaptchaError("Error generating CAPTCHA IDs");
        }

        let session: CaptchaSession;
        try {
            session = createCaptchaSession(
                sessionID,
                characterCountValue(),
                lifetimeValue(),
                attemptLimitValue(),
            );
        } catch (_) {
            return renderCaptchaError("Error generating CAPTCHA. Please refresh the page and try again.");
        }

        let rootID: string;
        let tilesID: string;
        let targetID: string;
        try {
            rootID = generateSecureID("captcha3Root_");
            tilesID = generateSecureID("captcha3Tiles_");
            targetID = generateSecureID("captcha3Target_");
        } catch (_) {
            return renderCaptchaError("Error generating CAPTCHA IDs");
        }

        let successPath = "";
        try {
            if (ctx && state.onValidated) {
                const callable = ctx.Callable(state.onValidated);
                if (callable && callable.url) {
                    successPath = callable.url;
                }
            }
        } catch (_) {
            /* ignore */
        }

        const scrambled = shuffleStringSecure(session.text);
        const defaultSuccess = ui.div("text-green-600")("Captcha validated successfully!");
        const scriptSource = `setTimeout(function () {
				var root = document.getElementById('${rootID}');
				var tilesContainer = document.getElementById('${tilesID}');
				var targetContainer = document.getElementById('${targetID}');
				var arrangementInput = root ? root.querySelector('input[name="${escapeJS(arrangementFieldName())}"]') : null;
				var verifiedInput = root ? root.querySelector('input[name="${escapeJS(clientVerifiedFieldName())}"]') : null;
				if (!root || !tilesContainer) { return; }

				var captchaText = '${escapeJS(session.text)}';
				var scrambled = '${escapeJS(scrambled)}';
				var successPath = '${escapeJS(successPath)}';
				var defaultSuccess = '${escapeJS(defaultSuccess)}';

				var solved = false;
				var tiles = scrambled ? scrambled.split('') : [];
				if (!tiles.length) { tiles = captchaText.split(''); }

				var uniqueChars = Object.create(null);
				captchaText.split('').forEach(function (c) { uniqueChars[c] = true; });
				if (tiles.join('') === captchaText && Object.keys(uniqueChars).length > 1) {
					tiles = captchaText.split('').reverse();
				}

				function renderTarget() {
					if (!targetContainer) { return; }
					// Clear container safely
					while (targetContainer.firstChild) {
						targetContainer.removeChild(targetContainer.firstChild);
					}
					captchaText.split('').forEach(function (char) {
						var item = document.createElement('div');
						item.className = 'inline-flex items-center justify-center px-3 py-2 rounded border text-sm font-semibold tracking-wide uppercase';
						item.textContent = char;
						item.setAttribute('role', 'listitem');
						item.setAttribute('aria-label', 'Target character ' + char);
						targetContainer.appendChild(item);
					});
					targetContainer.setAttribute('aria-hidden', 'false');
					targetContainer.setAttribute('role', 'list');
					targetContainer.setAttribute('aria-label', 'Target sequence');
				}

				function syncHidden() {
					if (arrangementInput) { arrangementInput.value = tiles.join(''); }
					if (!solved && verifiedInput) { verifiedInput.value = 'false'; }
				}

				function updateContainerAppearance() {
					if (!tilesContainer) { return; }
					tilesContainer.classList.toggle('border-slate-300', !solved);
					tilesContainer.classList.toggle('border-green-500', solved);
					tilesContainer.classList.toggle('bg-emerald-50', solved);
				}

				var baseTileClass = 'cursor-move select-none inline-flex items-center justify-center w-12 px-3 py-2 rounded border border-dashed border-gray-400 bg-white text-lg font-semibold shadow-sm transition-all duration-150';
				var solvedTileClass = ' bg-green-600 text-white border-green-600 shadow-none cursor-default';

				function renderTiles() {
					if (!tilesContainer) { return; }
					// Clear container safely
					while (tilesContainer.firstChild) {
						tilesContainer.removeChild(tilesContainer.firstChild);
					}
					updateContainerAppearance();
					for (var i = 0; i < tiles.length; i++) {
						var tile = document.createElement('div');
						tile.className = baseTileClass;
						tile.textContent = tiles[i];
						tile.setAttribute('data-index', String(i));
						tile.setAttribute('draggable', solved ? 'false' : 'true');
						tile.setAttribute('aria-grabbed', 'false');
						tile.setAttribute('role', 'listitem');
						tile.setAttribute('aria-label', 'Character ' + tiles[i]);
						tilesContainer.appendChild(tile);
					}
					tilesContainer.setAttribute('tabindex', '0');
					tilesContainer.setAttribute('aria-live', 'polite');
					tilesContainer.setAttribute('aria-atomic', 'true');
					tilesContainer.setAttribute('aria-relevant', 'additions removals');
					tilesContainer.setAttribute('aria-label', 'Captcha character tiles - drag to reorder');
					syncHidden();
				}

				function injectSuccess(html) {
					if (!root) { return; }
					var output = (html && html.trim()) ? html : defaultSuccess;
					// Use DOMParser for safer HTML parsing if available
					try {
						if (typeof DOMParser !== 'undefined') {
							var parser = new DOMParser();
							var doc = parser.parseFromString(output, 'text/html');
							// Clear root safely
							while (root.firstChild) {
								root.removeChild(root.firstChild);
							}
							// Append parsed nodes
							while (doc.body.firstChild) {
								root.appendChild(doc.body.firstChild);
							}
						} else {
							// Fallback to innerHTML if DOMParser not available (with risk noted)
							root.innerHTML = output;
						}
					} catch (e) {
						// Final fallback to text content
						root.textContent = 'CAPTCHA completed successfully!';
					}
				}

				function markSolved() {
					if (solved) { return; }
					solved = true;
					if (verifiedInput) { verifiedInput.value = 'true'; }
					if (arrangementInput) { arrangementInput.value = captchaText; }

					if (tilesContainer) {
						var nodes = tilesContainer.children;
						for (var i = 0; i < nodes.length; i++) {
							var node = nodes[i];
							node.className = baseTileClass + solvedTileClass;
							node.setAttribute('draggable', 'false');
						}
					}

					updateContainerAppearance();

					if (successPath) {
						fetch(successPath, {
							method: 'POST',
							credentials: 'same-origin',
							headers: { 'Content-Type': 'application/json' },
							body: '[]'
						})
							.then(function (resp) { if (!resp.ok) { throw new Error('HTTP ' + resp.status); } return resp.text(); })
							.then(injectSuccess)
							.catch(function () { injectSuccess(defaultSuccess); });
					} else {
						injectSuccess(defaultSuccess);
					}
				}

				function checkSolved() {
					if (tiles.join('') === captchaText) {
						markSolved();
					}
				}

				tilesContainer.addEventListener('dragstart', function (event) {
					if (solved) { event.preventDefault(); return; }
					var tile = event.target && event.target.closest('[data-index]');
					if (!tile) { return; }
					tile.setAttribute('aria-grabbed', 'true');
					tile.classList.add('ring-2', 'ring-blue-300');
					event.dataTransfer.effectAllowed = 'move';
					event.dataTransfer.setData('text/plain', tile.getAttribute('data-index') || '0');
				});

				tilesContainer.addEventListener('dragover', function (event) {
					if (solved) { return; }
					event.preventDefault();
					event.dataTransfer.dropEffect = 'move';
				});

				tilesContainer.addEventListener('drop', function (event) {
					if (solved) { return; }
					event.preventDefault();
					var payload = event.dataTransfer.getData('text/plain');
					var from = parseInt(payload, 10);
					if (isNaN(from) || from < 0 || from >= tiles.length) { return; }

					var target = event.target && event.target.closest('[data-index]');
					var to = target ? parseInt(target.getAttribute('data-index') || '0', 10) : tiles.length;
					if (isNaN(to)) { to = tiles.length; }
					if (to > tiles.length) { to = tiles.length; }

					var char = tiles.splice(from, 1)[0];
					if (from < to) { to -= 1; }
					tiles.splice(to, 0, char);

					renderTiles();
					checkSolved();
				});

				tilesContainer.addEventListener('dragend', function (event) {
					var tile = event.target && event.target.closest('[data-index]');
					if (tile) {
						tile.setAttribute('aria-grabbed', 'false');
						tile.classList.remove('ring-2', 'ring-blue-300');
					}
				});

				tilesContainer.addEventListener('dragleave', function (event) {
					var tile = event.target && event.target.closest('[data-index]');
					if (tile) {
						tile.classList.remove('ring-2', 'ring-blue-300');
					}
				});

				renderTarget();
				renderTiles();
				checkSolved();
			}, 250);
		`;

        return ui.div("flex flex-col items-start gap-3 w-full", { 
            id: rootID,
            role: 'application',
            'aria-label': 'CAPTCHA puzzle - drag and drop characters to solve',
            'aria-describedby': `${rootID}-instructions`
        })(
            ui.div("", { id: `${rootID}-instructions` })(
                ui.span("text-sm text-gray-600 mb-2")(
                    "Drag and drop the characters on the canvas until they match the sequence below.",
                ),
            ),
            ui.div("flex flex-col w-full border border-gray-300 rounded-lg")(
                ui.div("flex flex-wrap gap-2 justify-center items-center m-4", { 
                    id: targetID,
                    'aria-hidden': 'false',
                    role: 'group',
                    'aria-label': 'Target sequence'
                })(),
                ui.div(
                    "flex flex-wrap gap-3 justify-center items-center rounded-b-lg border bg-gray-200 shadow-sm p-4 min-h-[7.5rem] transition-colors duration-300",
                    { 
                        id: tilesID,
                        role: 'list',
                        'aria-live': 'polite',
                        'aria-atomic': 'true',
                        'aria-relevant': 'additions removals',
                        'aria-label': 'Captcha character tiles - drag to reorder',
                        'aria-dropeffect': 'move',
                        tabindex: '0',
                    },
                )(),
            ),
            ui.Hidden(sessionFieldName(), "string", sessionID),
            ui.Hidden(arrangementFieldName(), "string", scrambled),
            ui.Hidden(clientVerifiedFieldName(), "bool", "false"),
            ui.script(scriptSource),
        );
    }

    function validateValues(sessionID: string, arrangement: string): CaptchaValidationResult {
        return validateCaptcha(sessionID, arrangement);
    }

    function validate(sessionID: string, arrangement: string): CaptchaValidationResult {
        return validateValues(sessionID, arrangement);
    }

    // function validateRequest(req: IncomingMessage): CaptchaValidationResult {
    //     if (!req) {
    //         return { ok: false, error: new Error("missing request") };
    //     }
    //     const items = RequestBody(req);
    //     const sessionID = findBodyValue(items, sessionFieldName());
    //     const arrangement = findBodyValue(items, arrangementFieldName());
    //     return validateValues(sessionID, arrangement);
    // }

    const component = {
        SessionField: sessionField,
        ArrangementField: arrangementField,
        ClientVerifiedField: clientVerifiedField,
        Count: count,
        Lifetime: lifetime,
        Attempts: attempts,
        SessionFieldName: sessionFieldName,
        ArrangementFieldName: arrangementFieldName,
        ClientVerifiedFieldName: clientVerifiedFieldName,
        Render: render,
        ValidateValues: validateValues,
        Validate: validate,
        // ValidateRequest: validateRequest,
    };

    return component;
}
