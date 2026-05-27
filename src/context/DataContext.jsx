import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();

  const [payments,      setPayments]      = useState([]);
  const [tickets,       setTickets]       = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Charge les données au démarrage et quand l'utilisateur change
  useEffect(() => {
    if (!user) return;
    setPayments     (JSON.parse(localStorage.getItem("rc_payments")      || "[]"));
    setTickets      (JSON.parse(localStorage.getItem("rc_tickets")       || "[]"));
    setAnnouncements(JSON.parse(localStorage.getItem("rc_announcements") || "[]"));
  }, [user]);

  // ── Helpers de sauvegarde ──
  const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  // ────────────────── PAIEMENTS ──────────────────

  // Gestionnaire : ajoute une charge pour un résident
  const addPayment = (payment) => {
    const updated = [{
      id:       Date.now(),
      ...payment,
      status:   "En attente",
      date:     new Date().toLocaleDateString("fr-FR"),
    }, ...payments];
    setPayments(updated);
    save("rc_payments", updated);
  };

  // Gestionnaire : marque un paiement comme payé
  const markPaid = (id) => {
    const updated = payments.map((p) =>
      p.id === id ? { ...p, status: "Payé", paidAt: new Date().toLocaleDateString("fr-FR") } : p
    );
    setPayments(updated);
    save("rc_payments", updated);
  };

  // Résident : ne voit que ses paiements
  const myPayments = payments.filter((p) => p.residentId === user?.id);

  // ────────────────── TICKETS ──────────────────

  // Résident : crée un ticket
  const addTicket = (ticket) => {
    const updated = [{
      id:          Date.now(),
      reference:   `TK-${String(tickets.length + 1).padStart(3, "0")}`,
      ...ticket,
      status:      "Ouvert",
      residentId:  user.id,
      residentName:`${user.firstName} ${user.lastName}`,
      date:        new Date().toLocaleDateString("fr-FR"),
    }, ...tickets];
    setTickets(updated);
    save("rc_tickets", updated);
  };

  // Gestionnaire : change le statut d'un ticket
  const updateTicketStatus = (id, status) => {
    const updated = tickets.map((t) =>
      t.id === id ? { ...t, status, updatedAt: new Date().toLocaleDateString("fr-FR") } : t
    );
    setTickets(updated);
    save("rc_tickets", updated);
  };

  // Résident : ne voit que ses tickets
  const myTickets = tickets.filter((t) => t.residentId === user?.id);

  // ────────────────── ANNONCES ──────────────────

  // Gestionnaire : publie une annonce
  const addAnnouncement = (announcement) => {
    const updated = [{
      id:        Date.now(),
      ...announcement,
      authorId:  user.id,
      authorName:`${user.firstName} ${user.lastName}`,
      date:      new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    }, ...announcements];
    setAnnouncements(updated);
    save("rc_announcements", updated);
  };

  // Gestionnaire : supprime une annonce
  const deleteAnnouncement = (id) => {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    save("rc_announcements", updated);
  };

  // ────────────────── STATS DASHBOARD ──────────────────

  const residentStats = {
    paymentStatus:     myPayments.find((p) => {
      const now   = new Date();
      const month = now.toLocaleString("fr-FR", { month: "long", year: "numeric" });
      return p.label?.toLowerCase().includes(month.toLowerCase());
    })?.status ?? (myPayments.length === 0 ? "Aucune charge" : "À jour"),
    openTickets:       myTickets.filter((t) => t.status !== "Résolu").length,
    newAnnouncements:  announcements.length,
    recentTickets:     myTickets.slice(0, 3),
    recentAnnouncements: announcements.slice(0, 3),
  };

  const managerStats = {
    totalResidents:   [...new Set(payments.map((p) => p.residentId))].length,
    paidPayments:     payments.filter((p) => p.status === "Payé").length,
    pendingPayments:  payments.filter((p) => p.status !== "Payé").length,
    openTickets:      tickets.filter((t) => t.status === "Ouvert" || t.status === "En cours").length,
    recentTickets:    tickets.slice(0, 4),
    pendingList:      payments.filter((p) => p.status !== "Payé").slice(0, 4),
  };

  return (
    <DataContext.Provider value={{
      // Paiements
      payments, myPayments, addPayment, markPaid,
      // Tickets
      tickets, myTickets, addTicket, updateTicketStatus,
      // Annonces
      announcements, addAnnouncement, deleteAnnouncement,
      // Stats
      residentStats, managerStats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}