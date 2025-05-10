import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useCallback } from "react";
import { useForm, getFormProps, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { z } from "zod";
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { data, Form, useActionData } from "@remix-run/react";
import { flushSync } from "react-dom";

export const meta: MetaFunction = () => {
  return [
    { title: "Conform + Headless UI Listbox Example" },
    { name: "description", content: "Conform with Headless UI Listbox" },
  ];
};

const options = ["Option 1", "Option 2", "Option 3"];

const schema = z.object({
  option: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return data(submission.reply());
  }

  console.log("Form submission:", submission.value);

  return;
}

export default function Index() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  const control = useInputControl(fields.option);

  const handleUpdate = useCallback(() => {
    flushSync(() => {
      form.update({
        name: fields.option.name,
        value: options[Math.floor(Math.random() * options.length)],
      });
    });
  }, [fields.option, form]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Conform + Headless UI Listbox Example
          </h1>
        </header>
        <Form {...getFormProps(form)} className="flex flex-col gap-4">
          <div>
            <Listbox value={control.value} onChange={control.change}>
              <ListboxButton className="border rounded p-2 w-48 text-left bg-white dark:bg-gray-800 shadow-sm">
                {control.value ?? "Select an option"}
              </ListboxButton>
              <ListboxOptions className="border rounded p-2 w-48 bg-white dark:bg-gray-800 shadow-md">
                {options.map((option) => (
                  <ListboxOption key={option} value={option}>
                    {option}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Listbox>
            {fields.option.errors && (
              <div className="text-red-500">{fields.option.errors}</div>
            )}
          </div>
          <button type="submit" className="bg-blue-500 text-white rounded p-2">
            Submit
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="bg-gray-500 text-white rounded p-2"
          >
            Update Random Option
          </button>
          <div>
            <p>
              Option value:{" "}
              <code className="bg-gray-300">
                {JSON.stringify(control.value)}
              </code>
            </p>
          </div>
        </Form>
      </div>
    </div>
  );
}
