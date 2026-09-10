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
				a.setAttribute("title", "Steam page coming soon");
			});
			return;
		}
		a.setAttribute("target", "_blank");
		a.setAttribute("rel", "noopener noreferrer");
	});

	// Hide the whole social row if nothing has been filled in yet.
	var socials = document.querySelector(".socials");
	if (socials && !socials.querySelector("li:not([hidden])")) socials.hidden = true;

	/* ---- Contact form ---- */
	var form = document.getElementById("contactForm");
	var status = document.getElementById("formStatus");
	if (form) {
		var endpoint = form.getAttribute("action") || "";
		var configured = endpoint.indexOf("YOUR_FORM_ID") === -1;
		var mailLink = document.querySelector(".contact__email a[href^='mailto:']");
		var mailto = mailLink ? mailLink.getAttribute("href").replace(/^mailto:/, "") : "";

		form.addEventListener("submit", function (e) {
			e.preventDefault();
			var data = new FormData(form);
			var name = data.get("name") || "";
			var email = data.get("email") || "";
			var message = data.get("message") || "";

			if (!configured) {
				// No form backend yet: hand off to the visitor's email app.
				var subject = encodeURIComponent("Message from " + name + " via higgygames site");
				var body = encodeURIComponent(message + "\n\n— " + name + " <" + email + ">");
				window.location.href = "mailto:" + mailto + "?subject=" + subject + "&body=" + body;
				setStatus("Opening your email app…", "");
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
					setStatus("Something went wrong. Please email us directly instead.", "is-error");
				})
				.then(function () { btn.disabled = false; });
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
