# Domain Vision Statement — Fintech Billetera

## Producto

Billetera digital P2P (tipo Nequi/Daviplata) para Colombia. Cuentas de trámite simplificado: usuarios envían/reciben dinero por celular, con cumplimiento SARLAFT y límites regulatorios.

## Core Domain

**Procesamiento atómico de pagos P2P con invariantes regulatorias.** El conocimiento profundo aquí:

- Cálculo en tiempo real de límite diario (Decreto 1872/2021)
- Saldo máximo acumulado y límite por transacción
- Detección de patrones AML antes del débito
- Bloqueo automático ante intentos fallidos / actividad sospechosa
- Coherencia transaccional entre cuenta origen y destino bajo concurrencia

**Por qué es diferenciador**: cada error vale una multa de la Superfinanciera. La competencia técnica del modelo de invariantes ES el producto.

## Subdominios

| Subdominio | Tipo | Estrategia |
|---|---|---|
| **Billetera** (saldo, pagos, límites) | Core | Best engineers · DDD táctico estricto · cobertura de tests >90% en aggregates |
| **Cumplimiento AML/KYC** | Supporting | Construir, no comprar — reglas son específicas del regulador colombiano |
| **Notificaciones (SMS/push)** | Generic | Twilio + Firebase con ACL — no construir broker propio |
| **Identidad (Renaper)** | Generic | Conformist + ACL — adaptarse a la API del proveedor |
| **Reportes/Contabilidad** | Supporting | EF Core + read models · sin lógica compleja |

## Reglas no-negociables

1. Saldo nunca negativo — invariante transaccional, no eventual
2. Pago > límite diario → rechazar antes del débito
3. Cuenta bloqueada → cero envíos; recibe acreditaciones (fondos congelados)
4. PIN incorrecto 3 veces → auto-bloqueo
5. Eventos de dominio publicados solo después del commit (Outbox)

## Restricciones regulatorias

- Decreto 1872/2021 — cuenta trámite simplificado: máx COP 3.000.000/día, máx COP 9.000.000 saldo
- SARLAFT — Resolución Superfinanciera 027/2007 + actualizaciones
- Habeas Data Financiero (Ley 1266/2008) — almacenamiento de datos personales
- CRC — numeración móvil colombiana (10 dígitos, inicio en 3)

## Lo que NO es Core

- Auth/JWT — usar IdentityServer / Auth0
- Pasarela bancaria — PSE / proveedor externo
- Detección antifraude transversal — herramienta ML de tercero
