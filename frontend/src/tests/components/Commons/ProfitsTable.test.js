import { render, screen, waitFor } from "@testing-library/react";
import ProfitsTable from "main/components/Commons/ProfitsTable";
import profitsFixtures from "fixtures/profitsFixtures";

describe("ProfitsTable tests", () => {
    const testId = "ProfitsTable";

    const expectedHeaders = ["Profit", "Date", "Health", "Cows"];
    const expectedFields = ["Profit", "date", "Health", "numCows"];

    test("renders without crashing for 0 profits", () => {
        render(
            <ProfitsTable profits={[]} />
        );
    });

    test("renders without crashing", async () => {
        render(
            <ProfitsTable profits={profitsFixtures.threeProfits} />
        );
        await waitFor(()=>{
            expect(screen.getByTestId("ProfitsTable-header-Profit") ).toBeInTheDocument();
        });
    
        expectedHeaders.forEach((headerText) => {
          const header = screen.getByText(headerText);
          expect(header).toBeInTheDocument();
        });

    });

    test("renders table correctly with profits data", () => {
        render(
            <ProfitsTable profits={profitsFixtures.threeProfits} />
        );
        
        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expectedFields.forEach((field) => {
            const fieldElement = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
            expect(fieldElement).toBeInTheDocument();
        });

        profitsFixtures.threeProfits.forEach((profit, rowIndex) => {
            expect(screen.getByTestId(`${testId}-cell-row-${rowIndex}-col-Profit`))
                .toHaveTextContent(`$${profit.amount.toFixed(2)}`);

            expect(screen.getByTestId(`${testId}-cell-row-${rowIndex}-col-Health`))
                .toHaveTextContent(`${profit.avgCowHealth}%`);

            expect(screen.getByTestId(`${testId}-cell-row-${rowIndex}-col-numCows`))
                .toHaveTextContent(profit.numCows.toString());
        });
    });
});