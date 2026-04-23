const db = require("../models");

async function migrateMealDeductionsTo16_15() {
  try {
    console.log(
      "=== Migrating Meal Deductions from 21st-20th to 16th-15th Format ==="
    );

    // Get all meal deductions
    const mealDeductions = await db.MealDeduction.findAll({
      order: [["created_at", "ASC"]],
    });

    console.log(
      `Found ${mealDeductions.length} meal deduction records to migrate`
    );

    if (mealDeductions.length === 0) {
      console.log("No meal deductions found to migrate.");
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const deduction of mealDeductions) {
      try {
        console.log(`\n=== Processing Employee ${deduction.employee_id} ===`);
        console.log(`Original period: ${deduction.date}`);
        console.log(`Amount: ${deduction.amount} QAR`);
        console.log(`Visit count: ${deduction.visit_count}`);

        // Parse the old period format (21st-20th)
        const oldPeriodMatch = deduction.date.match(
          /(\d{1,2})\s+(\w+)\s+(\d{4})\s+-\s+(\d{1,2})\s+(\w+)\s+(\d{4})/
        );

        if (!oldPeriodMatch) {
          console.log("❌ Could not parse old period format, skipping...");
          skippedCount++;
          continue;
        }

        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        const oldStartDay = parseInt(oldPeriodMatch[1]);
        const oldStartMonth = months.indexOf(oldPeriodMatch[2]);
        const oldStartYear = parseInt(oldPeriodMatch[3]);
        const oldEndDay = parseInt(oldPeriodMatch[4]);
        const oldEndMonth = months.indexOf(oldPeriodMatch[5]);
        const oldEndYear = parseInt(oldPeriodMatch[6]);

        // Convert old period to new 16th-15th format
        // The old period was 21st to 20th, we need to convert to 16th to 15th
        // For example: "21 August 2025 - 20 September 2025" becomes "16 August 2025 - 15 September 2025"

        let newStartDay, newStartMonth, newStartYear;
        let newEndDay, newEndMonth, newEndYear;

        if (oldStartDay === 21) {
          // If old period starts on 21st, new period starts on 16th of same month
          newStartDay = 16;
          newStartMonth = oldStartMonth;
          newStartYear = oldStartYear;
        } else {
          // This shouldn't happen with the old format, but handle it
          console.log("⚠️  Unexpected old start day, using 16th of same month");
          newStartDay = 16;
          newStartMonth = oldStartMonth;
          newStartYear = oldStartYear;
        }

        if (oldEndDay === 20) {
          // If old period ends on 20th, new period ends on 15th of same month
          newEndDay = 15;
          newEndMonth = oldEndMonth;
          newEndYear = oldEndYear;
        } else {
          // This shouldn't happen with the old format, but handle it
          console.log("⚠️  Unexpected old end day, using 15th of same month");
          newEndDay = 15;
          newEndMonth = oldEndMonth;
          newEndYear = oldEndYear;
        }

        // Format the new period
        const formatPeriod = (startDate, endDate) => {
          const startDay = startDate.getDate();
          const startMonth = months[startDate.getMonth()];
          const startYear = startDate.getFullYear();

          const endDay = endDate.getDate();
          const endMonth = months[endDate.getMonth()];
          const endYear = endDate.getFullYear();

          return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
        };

        const newStartDate = new Date(newStartYear, newStartMonth, newStartDay);
        const newEndDate = new Date(newEndYear, newEndMonth, newEndDay);
        const newPeriodString = formatPeriod(newStartDate, newEndDate);

        console.log(`New period: ${newPeriodString}`);

        // Check if a meal deduction already exists for this employee and new period
        const existingDeduction = await db.MealDeduction.findOne({
          where: {
            employee_id: deduction.employee_id,
            date: newPeriodString,
          },
        });

        if (existingDeduction) {
          console.log(
            "⚠️  Meal deduction already exists for this employee and new period, skipping..."
          );
          skippedCount++;
          continue;
        }

        // Update the meal deduction with the new period
        await deduction.update({
          date: newPeriodString,
        });

        console.log("✅ Successfully migrated to new format");
        migratedCount++;
      } catch (error) {
        console.error(
          `❌ Error processing employee ${deduction.employee_id}:`,
          error.message
        );
        errorCount++;
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total records processed: ${mealDeductions.length}`);
    console.log(`Successfully migrated: ${migratedCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);

    // Verify the migration by showing some sample records
    console.log("\n=== Verification - Sample Migrated Records ===");
    const sampleRecords = await db.MealDeduction.findAll({
      limit: 5,
      order: [["updated_at", "DESC"]],
    });

    sampleRecords.forEach((record, index) => {
      console.log(
        `  ${index + 1}. Employee: ${record.employee_id}, Period: "${
          record.date
        }", Amount: ${record.amount} QAR`
      );
    });

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await db.sequelize.close();
  }
}

// Run the migration
migrateMealDeductionsTo16_15();
