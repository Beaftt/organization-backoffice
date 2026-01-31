import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "../Input";

describe("Input", () => {
  it("renders label and captures input", async () => {
    const user = userEvent.setup();

    render(<Input label="Nome" placeholder="Digite seu nome" />);

    const field = screen.getByPlaceholderText("Digite seu nome");
    expect(screen.getByText("Nome")).toBeInTheDocument();

    await user.type(field, "Lucas");
    expect(field).toHaveValue("Lucas");
  });
});
