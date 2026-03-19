export function getTransactionState(transaction) {
  if (transaction?.paid) return "paid";
  if (transaction?.waived) return "waived";
  return "unpaid";
}

export function isTransactionPayable(transaction) {
  return Boolean(transaction) && !transaction.paid && !transaction.waived;
}

export function getTransactionStatusMeta(transaction) {
  const state = getTransactionState(transaction);

  switch (state) {
    case "paid":
      return {
        label: "Paid",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "waived":
      return {
        label: "Waived",
        className: "border-sky-200 bg-sky-50 text-sky-700",
      };
    case "unpaid":
    default:
      return {
        label: "Unpaid",
        className: "border-rose-200 bg-rose-50 text-rose-700",
      };
  }
}

export function getOutstandingAmount(transactions = []) {
  return transactions
    .filter((transaction) => isTransactionPayable(transaction))
    .reduce((sum, transaction) => sum + parseFloat(transaction.amount || 0), 0);
}
