## Kernel 檔案與不變條款（不可變地基）

🧭 摘要

- 本檔案列出 core-engine/kernel 需要的檔案與每個檔案的「不變條款」。
- 沒有 domain、沒有 Firebase、沒有任何業務誘惑。
- 與 20、21 內容對齊；發現衝突時以 20 為準並同步更新。

### Table of Contents

- [Kernel 檔案清單](#kernel-檔案清單)
- [檔案不變條款](#檔案不變條款)
- [禁止事項](#禁止事項)
- [變更流程](#變更流程)

### Kernel 檔案清單

```
packages/
└─ core-engine/
   └─ src/
      └─ kernel/
         ├─ Event.ts
         ├─ Command.ts
         ├─ Causation.ts
         ├─ Correlation.ts
         ├─ SagaContext.ts
         ├─ Saga.ts
         ├─ SagaTransition.ts
         ├─ Compensation.ts
         ├─ Clock.ts
         ├─ Identity.ts
         └─ Invariants.ts
```

### 檔案不變條款

- **Event.ts**：不可變、無 methods、無 domain import。
- **Command.ts**：Command ≠ Event，可能失敗，不記錄 occurredAt。
- **Causation.ts**：只能指向已發生事件，不允許 optional 欄位。
- **Correlation.ts**：純線索，不解析、不計算。
- **SagaContext.ts**：只放狀態事實，不放 handler / transient flag。
- **Saga.ts**：純狀態機，不做 I/O、不 dispatch、不讀 DB。
- **SagaTransition.ts**：分離狀態與意圖，commands 可為空，不允許 side effect。
- **Compensation.ts**：宣告式補償，只看 context，未知失敗原因。
- **Clock.ts** / **Identity.ts**：時間、識別子抽象，避免直接 new Date()/UUID。
- **Invariants.ts**：集中放 kernel 級守則，供 lint/測試檢查。

### 禁止事項

- Domain 名稱、事件 enum、Firebase document shape。
- 將 handler/service 混入 kernel。
- 在 kernel 內做任何 I/O 或第三方 SDK 呼叫。

### 變更流程

- [ ] 先在 20、21 更新語意與不變量。
- [ ] 再同步此清單，確保檔案/守則對齊。
- [ ] 變更後跑 lint/測試，確認未引入 domain 依賴。

// END OF FILE
