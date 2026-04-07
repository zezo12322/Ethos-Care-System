import { Injectable } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import type { CasesService } from './cases.service';

type CaseReportRecord = Awaited<ReturnType<CasesService['findOne']>>;

@Injectable()
export class CasePdfService {
  async generateCasePdf(caseData: CaseReportRecord): Promise<Buffer> {
    const browserExecutablePath = this.resolveBrowserExecutablePath();
    const browser = await puppeteer.launch({
      executablePath: browserExecutablePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(this.buildHtml(caseData), {
        waitUntil: 'networkidle0',
      });
      await page.emulateMediaType('screen');

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '12mm',
          right: '10mm',
          bottom: '12mm',
          left: '10mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private buildHtml(caseData: CaseReportRecord) {
    const formData = caseData.formData as
      | Record<string, unknown>
      | null
      | undefined;
    const person = this.getRecord(formData?.person);
    const family = this.getRecord(formData?.family);
    const housing = this.getRecord(formData?.housing);
    const possessions = this.getRecord(formData?.possessions);
    const finance = this.getRecord(formData?.finance);
    const classification = this.getRecord(formData?.classification);
    const support = this.getRecord(formData?.support);

    const familyMembers = this.getArray(family.members);
    const possessionItems = this.getArray(possessions.items);
    const supportItems = this.getArray(support.items).filter((item) =>
      this.getBoolean(this.getRecord(item).selected),
    );

    const supportByCategory = Array.from(
      new Set(
        supportItems
          .map((item) => this.getString(this.getRecord(item).category))
          .filter(Boolean),
      ),
    ).map((category) => ({
      category,
      items: supportItems.filter(
        (item) => this.getString(this.getRecord(item).category) === category,
      ),
    }));

    const incomes = Object.entries(this.getRecord(finance.incomes));
    const expenses = Object.entries(this.getRecord(finance.expenses));
    const classificationTags = this.getArray(classification.tags);

    return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>بيان حالة - ${this.escapeHtml(caseData.applicantName)}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #f5f7f8;
        color: #162022;
        font-family: "Noto Sans Arabic", "Noto Naskh Arabic", Arial, sans-serif;
        direction: rtl;
      }
      .page {
        width: 100%;
        max-width: 1024px;
        margin: 0 auto;
        padding: 24px;
      }
      .hero {
        background: linear-gradient(135deg, #014976 0%, #0f6da1 100%);
        color: #fff;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 18px 40px rgba(1, 73, 118, 0.18);
      }
      .hero-main {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        padding: 24px;
      }
      .hero-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        padding: 0 24px 24px;
      }
      .stat {
        background: rgba(255,255,255,0.12);
        border-radius: 16px;
        padding: 14px 16px;
      }
      .stat small {
        display: block;
        color: rgba(255,255,255,0.8);
        margin-bottom: 6px;
        font-size: 12px;
      }
      .stat strong {
        font-size: 14px;
      }
      .section {
        margin-top: 18px;
        background: #fff;
        border: 1px solid #d8e0e2;
        border-radius: 24px;
        padding: 20px;
        box-shadow: 0 8px 24px rgba(16, 24, 40, 0.05);
      }
      h1, h2, h3, p { margin: 0; }
      h1 { font-size: 30px; margin-top: 4px; }
      h2 { font-size: 18px; margin-bottom: 14px; color: #0f1720; }
      h3 { font-size: 15px; margin-bottom: 10px; color: #0f1720; }
      .muted { color: #66747a; font-size: 12px; }
      .grid-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .card {
        border: 1px solid #e2e8ea;
        border-radius: 16px;
        padding: 12px 14px;
        background: #ffffff;
      }
      .card small {
        display: block;
        color: #6a7579;
        font-size: 11px;
        margin-bottom: 6px;
      }
      .card strong, .card div {
        font-size: 13px;
        line-height: 1.8;
      }
      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .tag {
        display: inline-block;
        padding: 5px 10px;
        border-radius: 999px;
        background: #e8f1f7;
        color: #014976;
        font-size: 12px;
        font-weight: 700;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        overflow: hidden;
        border-radius: 16px;
      }
      thead th {
        background: #eef3f5;
        color: #526068;
        font-size: 12px;
        text-align: right;
        padding: 11px 12px;
      }
      tbody td {
        padding: 11px 12px;
        border-top: 1px solid #e7ecee;
        font-size: 12px;
        vertical-align: top;
      }
      .stack {
        display: grid;
        gap: 10px;
      }
      .support-box {
        border: 1px solid #e2e8ea;
        border-radius: 16px;
        padding: 12px;
        background: #fbfcfc;
      }
      .two-columns {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .text-box {
        border: 1px solid #e2e8ea;
        background: #fff;
        border-radius: 16px;
        padding: 12px 14px;
        min-height: 74px;
        line-height: 1.9;
        font-size: 13px;
      }
      @page { size: A4; margin: 12mm; }
    </style>
  </head>
  <body>
    <div class="page">
      <section class="hero">
        <div class="hero-main">
          <div>
            <div class="muted" style="color: rgba(255,255,255,0.82)">بيان حالة</div>
            <h1>${this.escapeHtml(this.valueOf(person.fullName, caseData.applicantName))}</h1>
            <p style="margin-top: 10px; font-size: 13px; color: rgba(255,255,255,0.85)">
              رقم الحالة: ${this.escapeHtml(caseData.id.slice(0, 8).toUpperCase())}
            </p>
          </div>
          <div class="stack" style="min-width: 260px; font-size: 13px; line-height: 1.9">
            <div>نوع الدعم: <strong>${this.escapeHtml(caseData.caseType)}</strong></div>
            <div>الأولوية: <strong>${this.escapeHtml(this.formatPriority(caseData.priority))}</strong></div>
            <div>تاريخ التسجيل: <strong>${this.escapeHtml(this.formatDate(caseData.createdAt))}</strong></div>
          </div>
        </div>
        <div class="hero-stats">
          ${this.renderHeroStat('الحالة التشغيلية', caseData.lifecycleStatus)}
          ${this.renderHeroStat('القرار', caseData.decisionStatus)}
          ${this.renderHeroStat('استيفاء الملف', caseData.completenessStatus)}
          ${this.renderHeroStat('الموقع', this.valueOf(person.region, caseData.location))}
        </div>
      </section>

      ${this.renderSection(
        'بيانات الحالة',
        `
          <div class="grid-2">
            ${this.renderDetailCard('الاسم كامل', this.valueOf(person.fullName, caseData.applicantName))}
            ${this.renderDetailCard('الرقم القومي', this.valueOf(person.nationalId, caseData.nationalId ?? 'غير محدد'))}
            ${this.renderDetailCard('الديانة', person.religion)}
            ${this.renderDetailCard('تاريخ الميلاد', person.birthDate)}
            ${this.renderDetailCard('العمر', person.age)}
            ${this.renderDetailCard('النوع', person.gender)}
            ${this.renderDetailCard('رقم المحمول', person.mobile)}
            ${this.renderDetailCard('الوظيفة', person.job)}
            ${this.renderDetailCard('الدخل الشهري', person.monthlyIncome)}
            ${this.renderDetailCard('المؤهل التعليمي', person.educationState)}
            ${this.renderDetailCard('نوع التعليم', person.educationType)}
            ${this.renderDetailCard('المرحلة الدراسية', person.educationStage)}
            ${this.renderDetailCard('الصف الدراسي', person.schoolYear)}
            ${this.renderDetailCard('المدينة / القرية', person.region)}
            ${this.renderDetailCard('الجمعية', person.association)}
            ${this.renderDetailCard(
              'الدعم التمويني',
              this.getBoolean(person.tamweenSupport)
                ? `مستفيد - عدد المستفيدين ${this.escapeHtml(this.valueOf(person.tamweenBeneficiaries, 'غير محدد'))}`
                : 'غير مستفيد',
            )}
          </div>
          <div class="two-columns" style="margin-top: 12px;">
            <div class="text-box">
              <div class="muted">العنوان التفصيلي</div>
              ${this.escapeHtml(this.valueOf(person.detailedAddress, 'غير محدد'))}
            </div>
            <div class="text-box">
              <div class="muted">الوصف المختصر</div>
              ${this.escapeHtml(this.valueOf(caseData.description, 'لا يوجد وصف مدخل'))}
            </div>
          </div>
          <div class="card" style="margin-top: 12px;">
            <small>المرفقات</small>
            <div class="tags">
              ${this.renderTags(this.getArray(person.attachments))}
            </div>
          </div>
        `,
      )}

      ${this.renderSection(
        'بيانات الأسرة',
        familyMembers.length
          ? this.renderTable(
              [
                'الاسم',
                'القرابة',
                'التصنيف',
                'السن',
                'المحمول',
                'التعليم',
                'الوظيفة',
              ],
              familyMembers.map((member) => {
                const memberRecord = this.getRecord(member);
                return [
                  this.valueOf(memberRecord.name),
                  this.valueOf(memberRecord.relation),
                  this.valueOf(memberRecord.classification),
                  this.valueOf(memberRecord.age),
                  this.valueOf(memberRecord.mobile),
                  this.valueOf(memberRecord.education),
                  this.valueOf(memberRecord.job),
                ];
              }),
            )
          : `<div class="text-box">لا توجد بيانات أفراد أسرة مدخلة.</div>`,
      )}

      ${this.renderSection(
        'بيانات السكن',
        `
          <div class="grid-2">
            ${this.renderDetailCard('وصف حالة السكن', this.valueOf(housing.description))}
            ${this.renderDetailCard('طبيعة السكن', this.valueOf(housing.residencyType))}
            ${this.renderDetailCard('طبيعة دورات المياه', this.valueOf(housing.bathroomType))}
            ${this.renderDetailCard('حالة دورات المياه', this.valueOf(housing.bathroomState))}
            ${this.renderDetailCard('الكهرباء', this.valueOf(housing.electricity))}
            ${this.renderDetailCard('عداد المياه', this.valueOf(housing.water))}
            ${this.renderDetailCard('طلمبة المياه', this.valueOf(housing.waterPump))}
            ${this.renderDetailCard('أجهزة الطبخ', this.valueOf(housing.cookware))}
            ${this.renderDetailCard('التلفاز', this.valueOf(housing.tv))}
            ${this.renderDetailCard('الثلاجة', this.valueOf(housing.fridge))}
            ${this.renderDetailCard('الغسالة', this.valueOf(housing.washingMachine))}
            ${this.renderDetailCard('فرن خبيز', this.valueOf(housing.oven))}
            ${this.renderDetailCard('حاسب آلي', this.valueOf(housing.computer))}
            ${this.renderDetailCard('إنترنت', this.valueOf(housing.internet))}
          </div>
          <div class="grid-2" style="margin-top: 12px;">
            ${this.renderTagCard('السقف', this.getArray(housing.roof))}
            ${this.renderTagCard('الأرضية', this.getArray(housing.floor))}
            ${this.renderTagCard('المدخل', this.getArray(housing.entrance))}
            ${this.renderTagCard('الحوائط', this.getArray(housing.walls))}
            ${this.renderTagCard('وسيلة المواصلات', this.getArray(housing.transport))}
          </div>
        `,
      )}

      ${this.renderSection(
        'الحيازات',
        `
          <div class="grid-2">
            ${this.renderDetailCard('هل توجد حيازات؟', this.valueOf(possessions.hasPossessions))}
          </div>
          ${
            possessionItems.length
              ? `<div style="margin-top: 12px;">${this.renderTable(
                  ['الحيازة', 'النوع', 'القيمة', 'ملاحظات'],
                  possessionItems.map((item) => {
                    const itemRecord = this.getRecord(item);
                    return [
                      this.valueOf(itemRecord.name),
                      this.valueOf(itemRecord.type),
                      this.valueOf(itemRecord.value),
                      this.valueOf(itemRecord.notes),
                    ];
                  }),
                )}</div>`
              : ''
          }
        `,
      )}

      ${this.renderSection(
        'الدخل والمصروفات',
        `
          <div class="two-columns">
            <div>
              <h3>الدخل</h3>
              ${this.renderKeyValueList(incomes)}
            </div>
            <div>
              <h3>المصروفات</h3>
              ${this.renderKeyValueList(expenses)}
            </div>
          </div>
          <div class="card" style="margin-top: 12px;">
            <small>صافي الدخل الشهري</small>
            <strong>${this.escapeHtml(this.valueOf(finance.netMonthlyIncome, '0'))}</strong>
          </div>
        `,
      )}

      ${this.renderSection(
        'تصنيف الحالة',
        `
          <div class="grid-2">
            ${this.renderDetailCard('درجة التصنيف', this.valueOf(classification.degree))}
          </div>
          <div class="card" style="margin-top: 12px;">
            <small>تصنيفات الحالة</small>
            <div class="tags">${this.renderTags(classificationTags)}</div>
          </div>
        `,
      )}

      ${this.renderSection(
        'الدعم الحالي',
        `
          ${
            supportByCategory.length
              ? supportByCategory
                  .map(
                    (group) => `
                      <div class="support-box" style="margin-top: 12px;">
                        <h3>${this.escapeHtml(group.category)}</h3>
                        <div class="stack">
                          ${group.items
                            .map((item) => {
                              const itemRecord = this.getRecord(item);
                              return `
                                <div class="card">
                                  <small>${this.escapeHtml(this.valueOf(itemRecord.category))}</small>
                                  <strong>${this.escapeHtml(this.valueOf(itemRecord.name))}</strong>
                                  <div style="margin-top: 6px;">الوصف: ${this.escapeHtml(this.valueOf(itemRecord.notes, 'لا يوجد'))}</div>
                                  <div>التكلفة: ${this.escapeHtml(this.valueOf(itemRecord.cost, 'غير محددة'))}</div>
                                </div>
                              `;
                            })
                            .join('')}
                        </div>
                      </div>
                    `,
                  )
                  .join('')
              : `<div class="text-box">لا توجد خدمات محددة لهذه الحالة.</div>`
          }
          <div class="grid-2" style="margin-top: 12px;">
            ${this.renderDetailCard('أخصائي التنمية', this.valueOf(support.specialistName))}
            ${this.renderDetailCard('رأي أخصائي التنمية', this.valueOf(support.specialistOpinion))}
          </div>
          <div class="text-box" style="margin-top: 12px;">
            <div class="muted">ملاحظات أخصائي التنمية</div>
            ${this.escapeHtml(this.valueOf(support.specialistNotes, 'لا توجد ملاحظات'))}
          </div>
        `,
      )}
    </div>
  </body>
</html>`;
  }

  private renderSection(title: string, body: string) {
    return `<section class="section"><h2>${this.escapeHtml(title)}</h2>${body}</section>`;
  }

  private renderHeroStat(label: string, value: unknown) {
    return `<div class="stat"><small>${this.escapeHtml(label)}</small><strong>${this.escapeHtml(this.valueOf(value))}</strong></div>`;
  }

  private renderDetailCard(label: string, value: unknown) {
    return `<div class="card"><small>${this.escapeHtml(label)}</small><strong>${this.escapeHtml(this.valueOf(value))}</strong></div>`;
  }

  private renderTagCard(label: string, values: unknown[]) {
    return `<div class="card"><small>${this.escapeHtml(label)}</small><div class="tags">${this.renderTags(values)}</div></div>`;
  }

  private renderTags(values: unknown[]) {
    const items = values
      .map((value) => this.valueOf(value))
      .filter(Boolean)
      .map((value) => `<span class="tag">${this.escapeHtml(value)}</span>`);
    return items.length
      ? items.join('')
      : '<span class="muted">غير محدد</span>';
  }

  private renderTable(headers: string[], rows: string[][]) {
    return `<table><thead><tr>${headers
      .map((header) => `<th>${this.escapeHtml(header)}</th>`)
      .join('')}</tr></thead><tbody>${rows
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td>${this.escapeHtml(this.valueOf(cell))}</td>`)
            .join('')}</tr>`,
      )
      .join('')}</tbody></table>`;
  }

  private renderKeyValueList(entries: Array<[string, unknown]>) {
    return `<div class="stack">${entries
      .map(
        ([label, value]) =>
          `<div class="card"><small>${this.escapeHtml(label)}</small><strong>${this.escapeHtml(this.valueOf(value, '0'))}</strong></div>`,
      )
      .join('')}</div>`;
  }

  private formatDate(value: Date | string) {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(value));
  }

  private formatPriority(priority: string) {
    if (priority === 'URGENT') return 'عاجل';
    if (priority === 'HIGH') return 'عالي';
    if (priority === 'NORMAL') return 'عادي';
    return priority;
  }

  private getRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }

  private getArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private getBoolean(value: unknown): boolean {
    return value === true;
  }

  private getString(value: unknown) {
    return this.valueOf(value, '');
  }

  private resolveBrowserExecutablePath() {
    const envCandidates = [
      process.env.CHROME_EXECUTABLE_PATH,
      process.env.PUPPETEER_EXECUTABLE_PATH,
      process.env.CHROME_PATH,
      process.env.BROWSER_EXECUTABLE_PATH,
    ].filter(Boolean) as string[];

    const commandCandidates = [
      'google-chrome-stable',
      'google-chrome',
      'chromium-browser',
      'chromium',
      'msedge',
      'microsoft-edge',
      'microsoft-edge-stable',
      'brave-browser',
      'brave',
      'vivaldi',
      'opera',
      'opera-stable',
    ];

    const pathCandidates = this.getPlatformPathCandidates();

    const candidates = [
      ...envCandidates,
      ...commandCandidates.flatMap((command) => this.resolveCommand(command)),
      ...pathCandidates,
    ];

    const executablePath = candidates.find(
      (candidate) => candidate && existsSync(candidate),
    );

    if (!executablePath) {
      throw new Error(
        'تعذر العثور على متصفح مدعوم لتوليد PDF. يدعم النظام المتصفحات المبنية على Chromium مثل Chrome وChromium وEdge وBrave وVivaldi وOpera. يمكن تحديد المسار يدويًا عبر CHROME_EXECUTABLE_PATH.',
      );
    }

    return executablePath;
  }

  private resolveCommand(command: string) {
    const locator = process.platform === 'win32' ? 'where' : 'which';
    const result = spawnSync(locator, [command], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    if (result.status !== 0 || !result.stdout.trim()) {
      return [];
    }

    return result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  private getPlatformPathCandidates() {
    if (process.platform === 'darwin') {
      return [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        '/Applications/Vivaldi.app/Contents/MacOS/Vivaldi',
        '/Applications/Opera.app/Contents/MacOS/Opera',
      ];
    }

    if (process.platform === 'win32') {
      const localAppData = process.env.LOCALAPPDATA ?? '';
      const programFiles = process.env.PROGRAMFILES ?? 'C:\\Program Files';
      const programFilesX86 =
        process.env['PROGRAMFILES(X86)'] ?? 'C:\\Program Files (x86)';

      return [
        `${programFiles}\\Google\\Chrome\\Application\\chrome.exe`,
        `${programFilesX86}\\Google\\Chrome\\Application\\chrome.exe`,
        `${localAppData}\\Google\\Chrome\\Application\\chrome.exe`,
        `${programFiles}\\Microsoft\\Edge\\Application\\msedge.exe`,
        `${programFilesX86}\\Microsoft\\Edge\\Application\\msedge.exe`,
        `${localAppData}\\Microsoft\\Edge\\Application\\msedge.exe`,
        `${programFiles}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
        `${programFilesX86}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
        `${localAppData}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
        `${localAppData}\\Chromium\\Application\\chrome.exe`,
        `${programFiles}\\Vivaldi\\Application\\vivaldi.exe`,
        `${programFilesX86}\\Vivaldi\\Application\\vivaldi.exe`,
        `${localAppData}\\Vivaldi\\Application\\vivaldi.exe`,
        `${localAppData}\\Programs\\Opera\\opera.exe`,
      ];
    }

    return [
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/snap/bin/chromium',
      '/usr/bin/microsoft-edge',
      '/usr/bin/microsoft-edge-stable',
      '/usr/bin/brave-browser',
      '/usr/bin/vivaldi',
      '/usr/bin/opera',
    ];
  }

  private valueOf(value: unknown, fallback = 'غير محدد') {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed || fallback;
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'نعم' : 'لا';
    }
    return fallback;
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
