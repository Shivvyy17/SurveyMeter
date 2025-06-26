export function loadSurveys() {
  try {
    const json = localStorage.getItem('surveys');
    if (!json) return [];
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function saveSurveys(surveys) {
  localStorage.setItem('surveys', JSON.stringify(surveys));
}
