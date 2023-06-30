"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Control, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SOURCES } from "@/lib/sources/types";
import { ParserOutput } from "@/lib/sources";
import { Course } from "@prisma/client";
import { COURSES } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, FolderPlus, FolderX, ListPlus, X } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  title: z.string().nonempty(),
  time: z.string().nonempty(),
  servings: z.coerce.number().min(1),
  ingredientSets: z
    .array(
      z.object({
        name: z.string().nullish(),
        ingreds: z.object({ value: z.string() }).array().min(1),
      })
    )
    .min(1),
  instructionSets: z
    .array(
      z.object({
        name: z.string(),
        instructions: z.object({ value: z.string() }).array().min(1),
      })
    )
    .min(1),
  imageUrl: z.string().url(),
  notes: z.array(z.object({ value: z.string() })),
  postedAt: z.string().datetime().nullish(),
  // keywords: z.string().array(),
  courses: z.array(z.nativeEnum(Course)).min(1),
  sourceUrl: z.string().url(),
  source: z.enum(SOURCES),
});

type Props = {
  lead: ParserOutput;
};

function initialData(lead: ParserOutput) {
  if (lead.status === "success") {
    return {
      ...lead.recipe,
      ingredientSets: lead.recipe.ingredientSets.map((set) => ({
        name: set.name || "",
        ingreds: set.ingreds.map((i) => ({ value: i })),
      })),
      instructionSets: lead.recipe.instructionSets.map((set) => ({
        name: set.name || "",
        instructions: set.instructions.map((i) => ({ value: i })),
      })),
      notes: lead.recipe.notes.length
        ? lead.recipe.notes.map((n) => ({ value: n }))
        : [{ value: "" }],
    };
  }
  return {};
}

export default function RecipeForm({ lead }: Props) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initialData(lead),
  });

  const notesFields = useFieldArray({
    name: "notes",
    control: form.control,
  });
  const ingredientSetsFields = useFieldArray({
    name: "ingredientSets",
    control: form.control,
  });
  const instructionSetsFields = useFieldArray({
    name: "instructionSets",
    control: form.control,
  });

  function onSubmit(values: z.infer<typeof schema>) {
    console.log("::::: ✅", values);
  }

  return (
    <>
      <div>
        <Badge
          className="mb-6"
          variant={
            lead.status === "success"
              ? "success"
              : lead.status === "error"
              ? "destructive"
              : "outline"
          }
        >
          {lead.status}
        </Badge>
      </div>
      {lead.status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mb-6" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            This recipe could not be automatically imported! You can still fill
            out its data manually though.
          </AlertDescription>
        </Alert>
      ) : null}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4"
        >
          <div className="flex gap-4 col-span-2 flex-col lg:flex-row">
            <img
              src={form.getValues("imageUrl")}
              alt={form.getValues("title")}
              className="rounded-md object-cover w-full lg:w-[360px] lg:aspect-auto"
            />
            <div className="flex flex-col gap-2 grow">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.example.com/dish.jpg"
                        disabled
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sourceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source URL</FormLabel>
                    <FormControl>
                      <Input
                        disabled
                        placeholder="https://www.example.com/"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" type="number" {...field} />
                </FormControl>
                {/* <FormDescription>
                  This is your public display name.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postedAt"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2 justify-start">
                <FormLabel>Posted on</FormLabel>
                <FormControl>
                  <DatePicker
                    className="w-full"
                    onSelect={field.onChange}
                    value={field.value ? new Date(field.value) : undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the recipe source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SOURCES.map((s) => (
                      <SelectItem value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  You can manage verified email addresses in your{" "}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            {notesFields.fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`notes.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      Notes
                    </FormLabel>
                    <FormControl>
                      <span className="flex items-center gap-1">
                        <Textarea
                          {...field}
                          rows={3}
                          placeholder="Plum sauce: make sure to use a low FODMAP sauce."
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => notesFields.remove(index)}
                        >
                          <X size={20} />
                        </Button>
                      </span>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => notesFields.append({ value: "" })}
            >
              Add note
            </Button>
          </div>
          <FormField
            control={form.control}
            name="courses"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Sidebar</FormLabel>
                </div>
                {COURSES.map((item) => (
                  <FormField
                    key={"ff-course-" + item}
                    control={form.control}
                    name="courses"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={"fi-course-" + item}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked) => {
                                console.log(":::::: field", field);
                                return checked
                                  ? field.onChange(
                                      field.value
                                        ? [...field.value, item]
                                        : [item]
                                    )
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal lowercase">
                            {item}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-2">
            <h3 className="flex gap-2 items-center text-2xl font-semibold mb-3">
              Ingredient sets
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1"
                onClick={() =>
                  ingredientSetsFields.prepend({
                    name: "",
                    ingreds: [{ value: "" }],
                  })
                }
              >
                <FolderPlus />
              </Button>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {ingredientSetsFields.fields.map((set, index) => (
                <div
                  className="w-full rounded-lg border bg-card text-card-foreground shadow-sm p-4"
                  key={"set-ingred-" + set.id}
                >
                  <FormField
                    control={form.control}
                    key={"fi-ingred-" + set.id}
                    name={`ingredientSets.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="md:flex-grow mb-6">
                        <div className="flex space-x-2 justify-between items-baseline">
                          <FormLabel>Set Name</FormLabel>
                          <Button
                            type="button"
                            variant="destructiveOutline"
                            size="xs"
                            onClick={() => ingredientSetsFields.remove(index)}
                          >
                            <FolderX className="mr-2" />
                            Remove set
                          </Button>
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <NestedArrayFormField
                    addBtnLabel="Add ingredient"
                    setName="ingredientSets"
                    name="ingreds"
                    control={form.control}
                    nestIndex={index}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <h3 className="flex gap-2 items-center text-2xl font-semibold mb-3">
              Instruction sets
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1"
                onClick={() =>
                  instructionSetsFields.prepend({
                    name: "",
                    instructions: [{ value: "" }],
                  })
                }
              >
                <FolderPlus />
              </Button>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {instructionSetsFields.fields.map((set, index) => (
                <div
                  className="w-full rounded-lg border bg-card text-card-foreground shadow-sm p-4"
                  key={"set-instruct-" + set.id}
                >
                  <FormField
                    control={form.control}
                    key={"fi-instruct-" + set.id}
                    name={`instructionSets.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="md:flex-grow mb-6">
                        <div className="flex space-x-2 justify-between items-baseline">
                          <FormLabel>Set Name</FormLabel>
                          <Button
                            type="button"
                            variant="destructiveOutline"
                            size="xs"
                            disabled={instructionSetsFields.fields.length === 1}
                            onClick={() => instructionSetsFields.remove(index)}
                          >
                            <FolderX className="mr-2" />
                            Remove set
                          </Button>
                        </div>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <NestedArrayFormField
                    addBtnLabel="Add instruction"
                    setName="instructionSets"
                    name="instructions"
                    control={form.control}
                    nestIndex={index}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </>
  );
}

type NestedArrayFormFieldProps = {
  control: Control<typeof schema>;
  nestIndex: number;
  addBtnLabel: string;
} & (
  | { name: "ingreds"; setName: "ingredientSets" }
  | { name: "instructions"; setName: "instructionSets" }
);
function NestedArrayFormField(props: NestedArrayFormFieldProps) {
  const arrFields = useFieldArray({
    name: `${props.setName}.${props.nestIndex}.${props.name}`,
    control: props.control,
  });

  return (
    <div className="md:flex-grow lg:m-0 ml-10 mt-2">
      {arrFields.fields.map((field, index) => (
        <FormField
          control={props.control}
          key={field.id}
          name={`${props.setName}.${props.nestIndex}.${props.name}.${index}.value`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className={cn(index !== 0 && "sr-only")}>
                Ingredients
              </FormLabel>
              <FormControl>
                <span className="flex items-center gap-1">
                  <Input {...field} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => arrFields.remove(index)}
                  >
                    <X size={20} />
                  </Button>
                </span>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2"
        onClick={() => {
          arrFields.append({ value: "" });
        }}
      >
        <ListPlus className="mr-2" />
        {props.addBtnLabel}
      </Button>
    </div>
  );
}
