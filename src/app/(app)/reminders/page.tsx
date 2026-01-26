"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/lib/i18n/language-context";

type ReminderItem = {
  id: string;
  title: string;
  checked: boolean;
  financeType?: "income" | "expense";
  financeCategory?: string;
};

type ReminderList = {
  id: string;
  title: string;
  description?: string;
  monthlyReset: boolean;
  linkFinance: boolean;
  linkCalendar: boolean;
  items: ReminderItem[];
};

export default function RemindersPage() {
  const { t } = useLanguage();

  const initialLists = useMemo<ReminderList[]>(
    () => [
      {
        id: "l1",
        title: t.reminders.list.monthlyBills,
        description: t.reminders.quickAddHint,
        monthlyReset: true,
        linkFinance: true,
        linkCalendar: true,
        items: [
          {
            id: "i1",
            title: t.reminders.items.rent,
            checked: true,
            financeType: "expense",
            financeCategory: t.reminders.finance.service,
          },
          {
            id: "i2",
            title: t.reminders.items.electricity,
            checked: false,
            financeType: "expense",
            financeCategory: t.reminders.finance.service,
          },
          {
            id: "i3",
            title: t.reminders.items.internet,
            checked: false,
            financeType: "expense",
            financeCategory: t.reminders.finance.service,
          },
        ],
      },
      {
        id: "l2",
        title: t.reminders.list.groceries,
        description: t.reminders.quickAddHint,
        monthlyReset: false,
        linkFinance: false,
        linkCalendar: false,
        items: [
          { id: "i4", title: t.reminders.items.milk, checked: true },
          { id: "i5", title: t.reminders.items.vegetables, checked: false },
          { id: "i6", title: t.reminders.items.coffee, checked: false },
        ],
      },
    ],
    [t],
  );

  const [lists, setLists] = useState<ReminderList[]>(initialLists);
  const [selectedId, setSelectedId] = useState(initialLists[0]?.id ?? "");
  const [newItemTitle, setNewItemTitle] = useState("");

  const selectedList = lists.find((list) => list.id === selectedId) ?? lists[0];

  const toggleItem = (itemId: string) => {
    if (!selectedList) return;
    setLists((prev) =>
      prev.map((list) =>
        list.id === selectedList.id
          ? {
              ...list,
              items: list.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item,
              ),
            }
          : list,
      ),
    );
  };

  const addItem = () => {
    if (!selectedList || !newItemTitle.trim()) return;
    const id = `i-${Date.now()}`;
    setLists((prev) =>
      prev.map((list) =>
        list.id === selectedList.id
          ? {
              ...list,
              items: [
                ...list.items,
                { id, title: newItemTitle.trim(), checked: false },
              ],
            }
          : list,
      ),
    );
    setNewItemTitle("");
  };

  const updateListFlag = (
    key: "monthlyReset" | "linkFinance" | "linkCalendar",
    value: boolean,
  ) => {
    if (!selectedList) return;
    setLists((prev) =>
      prev.map((list) =>
        list.id === selectedList.id ? { ...list, [key]: value } : list,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{t.reminders.title}</h2>
          <p className="text-sm text-zinc-600">{t.reminders.subtitle}</p>
        </div>
        <Button>{t.reminders.newList}</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {t.reminders.listsTitle}
            </h3>
          </div>
          <div className="mt-4 space-y-3">
            {lists.map((list) => (
              <button
                key={list.id}
                type="button"
                onClick={() => setSelectedId(list.id)}
                className={`flex w-full flex-col gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  selectedList?.id === list.id
                    ? "border-[var(--border-strong)] bg-[var(--surface-muted)]"
                    : "border-[var(--border)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {list.title}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {list.items.filter((item) => item.checked).length}/{list.items.length}
                  </span>
                </div>
                {list.description ? (
                  <p className="text-xs text-zinc-500">{list.description}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {list.monthlyReset ? (
                    <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[11px] font-semibold text-zinc-600">
                      {t.reminders.badges.monthly}
                    </span>
                  ) : null}
                  {list.linkFinance ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                      {t.reminders.badges.financeLinked}
                    </span>
                  ) : null}
                  {list.linkCalendar ? (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700">
                      {t.reminders.badges.calendarLinked}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {t.reminders.itemsTitle}
              </h3>
              {selectedList ? (
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {selectedList.title}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={selectedList?.monthlyReset ?? false}
                onChange={(event) =>
                  updateListFlag("monthlyReset", event.target.checked)
                }
              />
              {t.reminders.monthlyResetLabel}
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={selectedList?.linkFinance ?? false}
                onChange={(event) =>
                  updateListFlag("linkFinance", event.target.checked)
                }
              />
              {t.reminders.financeLinkLabel}
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={selectedList?.linkCalendar ?? false}
                onChange={(event) =>
                  updateListFlag("linkCalendar", event.target.checked)
                }
              />
              {t.reminders.calendarLinkLabel}
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="min-w-[220px] flex-1">
              <Input
                label={t.reminders.addItem}
                placeholder={t.reminders.itemPlaceholder}
                value={newItemTitle}
                onChange={(event) => setNewItemTitle(event.target.value)}
              />
            </div>
            <Button onClick={addItem}>{t.reminders.addItem}</Button>
          </div>

          <div className="mt-4 space-y-3">
            {selectedList?.items.length ? (
              selectedList.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] px-4 py-3"
                >
                  <label className="flex items-center gap-3 text-sm font-medium text-[var(--foreground)]">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleItem(item.id)}
                    />
                    <span
                      className={
                        item.checked ? "line-through text-zinc-400" : undefined
                      }
                    >
                      {item.title}
                    </span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.checked
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.checked
                        ? t.reminders.statusDone
                        : t.reminders.statusPending}
                    </span>
                    {item.financeType ? (
                      <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                        {item.financeType === "income"
                          ? t.reminders.finance.income
                          : t.reminders.finance.expense}
                      </span>
                    ) : null}
                    {item.financeCategory ? (
                      <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-zinc-600">
                        {item.financeCategory}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">{t.reminders.emptyItems}</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
