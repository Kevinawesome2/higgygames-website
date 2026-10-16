/* HiggyGames — small progressive-enhancement script. No dependencies. */
(function () {
	"use strict";

	var topbar = document.getElementById("topbar");
	var nav = document.getElementById("siteNav");
	var toggle = document.getElementById("navToggle");
	var navLinks = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));

	/* ---- Solid top bar once the hero starts scrolling away ---- */
	function updateTopbar() {
		topbar.classList.toggle("is-solid", window.scrollY > 24);
	}
	window.addEventListener("scroll", updateTopbar, { passive: true });
	updateTopbar();

	/* ---- Hero background: cycle through the gameplay clips ---- */
	var heroVideo = document.getElementById("heroVideo");
	var heroClips = ["basket-make", "donut-gameplay", "skin-pickup", "turning"];
	if (heroVideo) {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			// Leave the still hero image showing instead.
			heroVideo.parentNode.removeChild(heroVideo);
		} else {
			var heroClip = 0;
			heroVideo.addEventListener("ended", function () {
				heroClip = (heroClip + 1) % heroClips.length;
				heroVideo.src = "assets/videos/" + heroClips[heroClip] + ".mp4";
				heroVideo.play();
			});
		}
	}

	/* ---- Mobile menu ---- */
	function closeMenu() {
		nav.classList.remove("is-open");
		toggle.setAttribute("aria-expanded", "false");
		toggle.setAttribute("aria-label", "Open menu");
	}
	toggle.addEventListener("click", function () {
		var open = !nav.classList.contains("is-open");
		nav.classList.toggle("is-open", open);
		toggle.setAttribute("aria-expanded", String(open));
		toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
	});
	navLinks.forEach(function (a) { a.addEventListener("click", closeMenu); });
	document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
	document.addEventListener("click", function (e) {
		if (!nav.contains(e.target) && !toggle.contains(e.target)) closeMenu();
	});

	/* ---- Highlight the nav link for the section in view ---- */
	var sections = navLinks
		.map(function (a) { return document.querySelector(a.getAttribute("href")); })
		.filter(Boolean);

	if ("IntersectionObserver" in window && sections.length) {
		var spy = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (!entry.isIntersecting) return;
				navLinks.forEach(function (a) {
					a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
				});
			});
		}, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
		sections.forEach(function (s) { spy.observe(s); });
	}

	/* ---- Reveal-on-scroll ---- */
	var revealEls = document.querySelectorAll(".reveal");
	if ("IntersectionObserver" in window) {
		var revealer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					revealer.unobserve(entry.target);
				}
			});
		}, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
		revealEls.forEach(function (el) { revealer.observe(el); });
	} else {
		revealEls.forEach(function (el) { el.classList.add("is-visible"); });
	}

	/* ---- External links: open in a new tab; hide unset social icons ---- */
	Array.prototype.forEach.call(document.querySelectorAll("a[data-external]"), function (a) {
		var href = a.getAttribute("href") || "#";
		var unset = href === "#" || href === "";
		if (unset) {
			var li = a.closest(".socials > li");
			if (li) { li.hidden = true; return; }
			// Unset Steam buttons stay visible but explain themselves instead of jumping to the top.
			a.addEventListener("click", function (e) {
				e.preventDefault();
				// Keyboard activation has no pointer position, so fall back to the button itself.
				var r = a.getBoundingClientRect();
				var tip = document.createElement("div");
				tip.className = "coming-soon";
				tip.setAttribute("role", "status");
				tip.textContent = "Coming soon...";
				tip.style.left = (e.clientX || r.left + r.width / 2) + "px";
				tip.style.top = (e.clientY || r.top) + "px";
				document.body.appendChild(tip);
				setTimeout(function () { tip.remove(); }, 1400);
			});
			return;
		}
		a.setAttribute("target", "_blank");
		a.setAttribute("rel", "noopener noreferrer");
	});

	// Hide the whole social row if nothing has been filled in yet.
	var socials = document.querySelector(".socials");
	if (socials && !socials.querySelector("li:not([hidden])")) socials.hidden = true;

	// Mirror the footer socials into the top bar, right of the wordmark.
	if (socials && !socials.hidden) {
		var topSocials = socials.cloneNode(true);
		topSocials.classList.add("socials--top");
		document.querySelector(".wordmark").after(topSocials);
	}

	/* ---- Contact form ---- */
	var form = document.getElementById("contactForm");
	var status = document.getElementById("formStatus");
	if (form) {
		var endpoint = form.getAttribute("action") || "";

		// Cloudflare Turnstile spam check. Only load the widget once a real site key is in place,
		// so the form keeps working while the key is still the placeholder.
		var captcha = form.querySelector(".cf-turnstile");
		if (captcha && (captcha.getAttribute("data-sitekey") || "").indexOf("YOUR_") === 0) {
			captcha.parentNode.removeChild(captcha);
			captcha = null;
		}
		if (captcha) {
			var turnstileScript = document.createElement("script");
			turnstileScript.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
			turnstileScript.async = true;
			turnstileScript.defer = true;
			document.head.appendChild(turnstileScript);
		}

		form.addEventListener("submit", function (e) {
			e.preventDefault();
			var data = new FormData(form);

			// Turnstile fills in cf-turnstile-response once it has verified the visitor.
			if (captcha && !data.get("cf-turnstile-response")) {
				setStatus("Still checking you're not a robot. Try again in a moment.", "is-error");
				return;
			}

			setStatus("Sending…", "");
			var btn = form.querySelector("button[type='submit']");
			btn.disabled = true;

			fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
				.then(function (res) {
					if (!res.ok) throw new Error("Request failed");
					form.reset();
					setStatus("Thanks! Your message is on its way.", "is-ok");
				})
				.catch(function () {
					setStatus("Something went wrong. Please try again, or reach us on Discord.", "is-error");
				})
				.then(function () {
					btn.disabled = false;
					// Turnstile tokens are single use, so ask for a fresh one before the next send.
					if (captcha && window.turnstile) window.turnstile.reset(captcha);
				});
		});
	}

	function setStatus(text, cls) {
		if (!status) return;
		status.textContent = text;
		status.className = "form__status" + (cls ? " " + cls : "");
	}

	/* ---- Footer year ---- */
	var year = document.getElementById("year");
	if (year) year.textContent = String(new Date().getFullYear());
})();
