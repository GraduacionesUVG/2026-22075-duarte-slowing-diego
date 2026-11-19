import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import Toast from "../../components/Toast";
import CategoryDialog from "../../components/CategoryDialog";
import { Skeleton, SkeletonRegion } from "../../components/Skeleton";

const meta = {
  title: "Admin/Avisos y diálogos",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ToastSuccess: Story = {
  name: "Aviso de éxito",
  render: () => <Toast toast={{ id: 1, kind: "success", message: 'Cambios en "Hamburguesa clásica" guardados.' }} onDismiss={fn()} />,
};

export const ToastError: Story = {
  name: "Aviso de error",
  render: () => (
    <Toast
      toast={{ id: 2, kind: "error", message: 'No se pudo guardar Hamburguesa clásica: Error interno del servidor.' }}
      onDismiss={fn()}
    />
  ),
};

export const NewCategory: Story = {
  name: "Nueva categoría (con selector de icono)",
  render: () => (
    <CategoryDialog
      existing={["Bebidas", "Postres"]}
      onClose={fn()}
      onSubmit={async ({ name }) => (name.toLowerCase() === "error" ? "No se pudo crear la categoría." : null)}
    />
  ),
};

export const EditCategory: Story = {
  name: "Editar categoría (renombrar y cambiar icono)",
  render: () => (
    <CategoryDialog
      existing={["Bebidas", "Postres", "psyres"]}
      category={{ name: "psyres", icon: "otros", productsCount: 3 }}
      onClose={fn()}
      onSubmit={async () => null}
    />
  ),
};

export const Skeletons: Story = {
  name: "Carga (skeleton)",
  render: () => (
    <SkeletonRegion label="Cargando…" className="flex max-w-md flex-col gap-3 p-6">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </SkeletonRegion>
  ),
};
