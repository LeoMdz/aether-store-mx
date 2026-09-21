import { themes } from "../themes";
export function setupThemeSwitcher(onFilter = () => {}) {
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTheme(id, focus = false) {
    if (!themes[id]) return;
    tabs.forEach((tab) => {
      const active = tab.dataset.tab === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    document
      .querySelectorAll('[role="tabpanel"]')
      .forEach((panel) => (panel.hidden = panel.id !== `panel-${id}`));
    if (focus) document.querySelector(`#tab-${id}`).focus();
  }
  function filter(id, updateUrl = true) {
    if (id !== "all" && !themes[id]) id = "all";
    document
      .querySelectorAll("[data-game]")
      .forEach((el) => (el.hidden = id !== "all" && el.dataset.game !== id));
    document
      .querySelector(".hero")
      .classList.toggle("is-filtered", id !== "all");
    filterButtons.forEach((button) =>
      button.setAttribute("aria-pressed", String(button.dataset.filter === id)),
    );
    document.querySelector("#catalog-count").textContent =
      id === "all"
        ? "3 universos. Infinitas posibilidades."
        : `Tu universo ${themes[id].name}.`;
    if (id !== "all") selectTheme(id);
    if (updateUrl) {
      const url = new URL(location.href);
      id === "all"
        ? url.searchParams.delete("juego")
        : url.searchParams.set("juego", id);
      history.replaceState({}, "", url);
    }
    onFilter(id);
  }
  filterButtons.forEach((button) =>
    button.addEventListener("click", () => filter(button.dataset.filter)),
  );
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-select]");
    if (link) selectTheme(link.dataset.select);
  });
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTheme(tab.dataset.tab));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft")
        next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectTheme(tabs[next].dataset.tab, true);
      }
    });
  });
  filter(new URLSearchParams(location.search).get("juego") || "all", false);
  window.addEventListener("popstate", () =>
    filter(new URLSearchParams(location.search).get("juego") || "all", false),
  );
  return { selectTheme, filter };
}
