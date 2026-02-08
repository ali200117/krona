import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Income, SavingsAccount, Expense } from '../types/budget';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [savings, setSavings] = useState<SavingsAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalSavings = savings.reduce((sum, s) => sum + s.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const rest = totalIncome - totalSavings - totalExpenses;

  // CRUD: Inntekt
  const addIncome = (name: string, amount: number) => {
    setIncomes([...incomes, { id: uuidv4(), name, amount }]);
  };

  const updateIncome = (id: string, name: string, amount: number) => {
    setIncomes(incomes.map(i => i.id === id ? { ...i, name, amount } : i));
  };

  const deleteIncome = (id: string) => {
    setIncomes(incomes.filter(i => i.id !== id));
  };

  // CRUD: Sparing
  const addSavings = (name: string, amount: number) => {
    setSavings([...savings, { id: uuidv4(), name, amount }]);
  };

  const updateSavings = (id: string, name: string, amount: number) => {
    setSavings(savings.map(s => s.id === id ? { ...s, name, amount } : s));
  };

  const deleteSavings = (id: string) => {
    setSavings(savings.filter(s => s.id !== id));
  };

  // CRUD: Utgifter
  const addExpense = (categoryName: string, amount: number) => {
    setExpenses([...expenses, { id: uuidv4(), categoryName, amount }]);
  };

  const updateExpense = (id: string, categoryName: string, amount: number) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, categoryName, amount } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h1>💰 Budsjett</h1>
        </div>

        {/* Sammendrag */}
        <div className={styles.summary}>
          <h2>Oversikt</h2>
          
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total inntekt</span>
            <span className={styles.summaryValue}>{totalIncome.toLocaleString('nb-NO')} kr</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total sparing</span>
            <span className={styles.summaryValue}>{totalSavings.toLocaleString('nb-NO')} kr</span>
          </div>

          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Total utgifter</span>
            <span className={styles.summaryValue}>{totalExpenses.toLocaleString('nb-NO')} kr</span>
          </div>

          <div className={`${styles.summaryRow} ${styles.restRow}`}>
            <span className={styles.summaryLabel}>Restbeløp</span>
            <span className={`${styles.summaryValue} ${styles.restValue} ${rest >= 0 ? styles.restPositive : styles.restNegative}`}>
              {rest.toLocaleString('nb-NO')} kr
            </span>
          </div>
        </div>

        {/* Inntekt */}
        <Section
          title="💵 Inntekt"
          items={incomes}
          onAdd={addIncome}
          onUpdate={updateIncome}
          onDelete={deleteIncome}
          labelName="Navn (f.eks. Lønn)"
        />

        {/* Sparing */}
        <Section
          title="🏦 Sparing"
          items={savings}
          onAdd={addSavings}
          onUpdate={updateSavings}
          onDelete={deleteSavings}
          labelName="Konto (f.eks. BSU)"
        />

        {/* Utgifter */}
        <Section
          title="💳 Utgifter"
          items={expenses}
          onAdd={addExpense}
          onUpdate={updateExpense}
          onDelete={deleteExpense}
          labelName="Kategori (f.eks. Husleie)"
        />
      </div>
    </div>
  );
}

function Section({ title, items, onAdd, onUpdate, onDelete, labelName }: any) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const handleAdd = () => {
    if (name.trim() && amount) {
      onAdd(name.trim(), Number(amount));
      setName('');
      setAmount('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setEditName(item.name || item.categoryName);
    setEditAmount(item.amount.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAmount('');
  };

  const saveEdit = (id: string) => {
    if (editName.trim() && editAmount) {
      onUpdate(id, editName.trim(), Number(editAmount));
      cancelEdit();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      
      {/* Legg til */}
      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder={labelName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.input}
        />
        <input
          type="number"
          placeholder="Beløp (kr)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.inputAmount}
        />
        <button onClick={handleAdd} className={styles.addButton}>
          Legg til
        </button>
      </div>

      {/* Liste */}
      {items.length === 0 ? (
        <p className={styles.emptyState}>Ingen oppføringer ennå</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item: any) => (
            <li key={item.id} className={styles.listItem}>
              {editingId === item.id ? (
                // EDIT MODE
                <div className={styles.itemEdit}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyPress={(e) => handleEditKeyPress(e, item.id)}
                    className={styles.input}
                  />
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    onKeyPress={(e) => handleEditKeyPress(e, item.id)}
                    className={styles.inputAmount}
                  />
                  <button onClick={() => saveEdit(item.id)} className={styles.saveButton}>
                    Lagre
                  </button>
                  <button onClick={cancelEdit} className={styles.cancelButton}>
                    Avbryt
                  </button>
                </div>
              ) : (
                // VIEW MODE
                <div className={styles.itemView}>
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name || item.categoryName}</div>
                    <div className={styles.itemAmount}>{item.amount.toLocaleString('nb-NO')} kr</div>
                  </div>
                  <div className={styles.itemActions}>
                    <button onClick={() => startEdit(item)} className={styles.editButton}>
                      Rediger
                    </button>
                    <button onClick={() => onDelete(item.id)} className={styles.deleteButton}>
                      Slett
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}