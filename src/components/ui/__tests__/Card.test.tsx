import { render, screen } from "@testing-library/react";
import { Card } from "../Card";

describe("Card", () => {
  it("renders children and optional id", () => {
    render(
      <Card id="summary-card">
        <span>Resumo</span>
      </Card>,
    );

    expect(screen.getByText("Resumo")).toBeInTheDocument();
    expect(document.querySelector("#summary-card")).toBeInTheDocument();
  });
});
