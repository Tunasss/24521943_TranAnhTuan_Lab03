import { SituationshipAnalyzer } from './components/SituationshipAnalyzer'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContent}>
        <SituationshipAnalyzer />
      </main>
      <footer className={styles.footer}>
        <p>
          UIT — Web Application Development (LAB 03 Bonus) • Situationship Finite State Machine
          Architecture
        </p>
      </footer>
    </div>
  )
}
