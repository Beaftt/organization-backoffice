import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("renders with the provided label", () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("fires click handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Confirmar</Button>);

    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
