const db = require("../models");
const fs = require("fs").promises;
const path = require("path");

async function backupMealDeductions() {
  try {
    console.log("=== Creating Backup of Meal Deductions ===");

    // Get all meal deductions
    const mealDeductions = await db.MealDeduction.findAll({
      order: [["created_at", "ASC"]],
    });

    console.log(
      `Found ${mealDeductions.length} meal deduction records to backup`
    );

    if (mealDeductions.length === 0) {
      console.log("No meal deductions found to backup.");
      return;
    }

    // Create backup data
    const backupData = {
      timestamp: new Date().toISOString(),
      totalRecords: mealDeductions.length,
      records: mealDeductions.map((deduction) => ({
        id: deduction.id,
        employee_id: deduction.employee_id,
        wage_type: deduction.wage_type,
        amount: deduction.amount,
        date: deduction.date,
        currency: deduction.currency,
        visit_count: deduction.visit_count,
        created_at: deduction.created_at,
        updated_at: deduction.updated_at,
      })),
    };

    // Create backup directory if it doesn't exist
    const backupDir = path.join(process.cwd(), "backups");
    await fs.mkdir(backupDir, { recursive: true });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `meal-deductions-backup-${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    // Write backup file
    await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), "utf8");

    console.log(`✅ Backup created successfully: ${filepath}`);
    console.log(`📊 Backup contains ${backupData.records.length} records`);

    // Show sample of backed up data
    console.log("\n=== Sample of Backed Up Data ===");
    backupData.records.slice(0, 3).forEach((record, index) => {
      console.log(
        `  ${index + 1}. Employee: ${record.employee_id}, Period: "${
          record.date
        }", Amount: ${record.amount} QAR`
      );
    });
  } catch (error) {
    console.error("❌ Backup failed:", error);
  } finally {
    await db.sequelize.close();
  }
}

// Run the backup
backupMealDeductions();
