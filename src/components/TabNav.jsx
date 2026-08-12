const TABS = [
  { id: 'identity', label: 'Card' },
  { id: 'library', label: 'Books' },
  { id: 'report', label: 'Recaps' },
]

export default function TabNav({ activeTab, onChange }) {
  const activeIndex = TABS.findIndex((tab) => tab.id === activeTab)
  const focusableTab = activeIndex === -1 ? 'identity' : activeTab

  function handleKeyDown(event) {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    const current = Math.max(activeIndex, 0)
    const offset = event.key === 'ArrowRight' ? 1 : -1
    const next = (current + offset + TABS.length) % TABS.length
    onChange(TABS[next].id)
    document.getElementById(`tab-${TABS[next].id}`)?.focus()
  }

  return (
    <div className="tab-nav" role="tablist" aria-label="Shelfie sections" onKeyDown={handleKeyDown}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={focusableTab === tab.id ? 0 : -1}
          className={activeTab === tab.id ? 'tab-nav__button is-active' : 'tab-nav__button'}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
