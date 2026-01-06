# Event Store 儲存策略

> 來源：✨/✨✨✨✨✨✨✨✨✨✨✨✨✨.md (Part 2/2)

## 🧠 儲存策略

### 選項 1：關聯式 DB

```sql
CREATE TABLE events (
  event_id UUID PRIMARY KEY,
  aggregate_id UUID,
  event_type VARCHAR,
  data JSONB,
  metadata JSONB,
  version INT
);

CREATE INDEX idx_aggregate 
  ON events(aggregate_id, version);
```

✅ 交易保證、版本控制
❌ 大量寫入效能較差

---

### 選項 2：Event Store 專用 DB

* EventStoreDB
* Apache Kafka
* AWS EventBridge

✅ 為 Event Sourcing 設計
✅ 高效能 append
❌ 額外學習成本

---

## 🫦 進階小騷包

### Snapshot（快照）

```ts
interface Snapshot<T = any> {
  aggregateId: string;
  version: number;
  state: T;
  timestamp: number;
}
```

👉 **從快照開始 replay，省時間 🚀**

---

## 🧠 一句話總結

> **Event Store 存真相，
> Aggregate 算當下，
> Projection 給方便。**

三者分工，才完整 😼
