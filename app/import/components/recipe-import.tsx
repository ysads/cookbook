"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ListOutput, ParserOutput } from "@/lib/sources";
import { RecipeLead, SOURCES, recipeImportSchema } from "@/lib/sources/types";
import { ListPlus, X, FolderX, FolderPlus } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Control, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Martian_Mono } from "next/font/google";
import { COURSES } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";

const martianMono = Martian_Mono({ subsets: ["latin"] });

const recipeImportFormSchema = recipeImportSchema;
type RecipeImport = z.infer<typeof recipeImportFormSchema>;
type Props = {
  parsed: ParserOutput;
};

export default function RecipeImport({ parsed }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  if (parsed.status === "skipped" || parsed.status === "error")
    return <h1>hi</h1>;

  const recipe = parsed.recipe;
  const form = useForm<z.infer<typeof recipeImportSchema>>({
    resolver: zodResolver(recipeImportSchema),
    mode: "onChange",
    defaultValues: {
      title: recipe.title,
      time: recipe.time,
      servings: recipe.servings,
      ingredientSets: recipe.ingredientSets.map((s) => ({
        name: s.name,
        ingreds: s.ingreds,
      })),
      instructionSets: recipe.instructionSets.map((s) => ({
        name: s.name,
        instructions: s.instructions,
      })),
      imageUrl: recipe.imageUrl,
      notes:
        recipe.notes.length > 0 ? recipe.notes.slice() : ["first", "second"],
      // notes: recipe.notes.length
      //   ? recipe.notes.map((n) => ({ value: n }))
      //   : [{ value: "first" }],
      postedAt: recipe.postedAt,
      keywords: recipe.keywords,
      courses: recipe.courses,
      source: recipe.source,
      sourceUrl: recipe.sourceUrl,
    },
  });
  const ingredientSetsFields = useFieldArray({
    name: "ingredientSets",
    control: form.control,
  });
  const instructionSetsFields = useFieldArray({
    name: "instructionSets",
    control: form.control,
  });
  const notesFields = useFieldArray({
    name: "notes",
    control: form.control,
  });
  const keywordsFields = useFieldArray({
    name: "keywords",
    control: form.control,
  });

  function onSubmit(values: z.infer<typeof recipeImportSchema>) {
    console.log(":::::::", values);
  }

  // useEffect(() => {
  //   titleRef.current?.scrollIntoView({ behavior: "smooth" });
  // });

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm md:col-span-4 lg:col-span-9 p-3 space-y-4 overflow-y-auto">
      {/* <pre className="text-mono text-xs bg-black text-green-400 p-2">
        {JSON.stringify(form.getValues(), null, 2)}
      </pre> */}
      <div className="flex items-center space-x-3">
        <h2 className="text-2xl tracking-tight font-bold" ref={titleRef}>
          {form.getValues("title") || "Untitled"}
        </h2>
        <Badge variant={parsed.status}>{parsed.status}</Badge>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) => console.log(":::: ola", d))}
          className="grid grid-cols-2 gap-4"
        >
          <div className="flex gap-3 col-span-2 flex-col lg:flex-row">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="rounded-md object-cover w-full lg:w-[300px] lg:h-[200px]"
            />
            <div className="flex flex-col gap-2 grow">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://www.example.com/dish.jpg"
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.example.com/" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <FormControl>
                  <Input placeholder="4h30min, 5h, 10min..." {...field} />
                </FormControl>
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
                  <Input placeholder="2, 4, 12..." {...field} />
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
                <FormLabel>Email</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            {notesFields.fields.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`notes.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={cn(index !== 0 && "sr-only")}>
                      Notes
                    </FormLabel>
                    <FormControl>
                      <span className="flex items-center gap-1">
                        <Textarea
                          {...field}
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
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                notesFields.append("");
              }}
            >
              <ListPlus className="mr-2" />
              Add note
            </Button>
          </div>

          {/* <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Plum sauce: make sure to use a low FODMAP sauce."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <FormField
            control={form.control}
            name="courses"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel>Courses</FormLabel>
                  <FormDescription>
                    Select the courses that apply to this recipe.
                  </FormDescription>
                </div>
                {COURSES.map((item) => (
                  <FormField
                    key={item}
                    control={form.control}
                    name="courses"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item + "-form-item"}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item)}
                              onCheckedChange={(checked: boolean) => {
                                console.log(
                                  "::::: checked",
                                  item,
                                  ":",
                                  checked
                                );
                                console.log("::::: field", field.value);
                                return checked
                                  ? field.onChange([...field.value, item])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal capitalize">
                            {item.toLocaleLowerCase()}
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
                    ingreds: [""],
                  })
                }
              >
                <FolderPlus />
              </Button>
            </h3>
            <div className="space-y-4">
              {ingredientSetsFields.fields.map((set, index) => (
                <div
                  className="flex flex-col md:flex-row md:gap-3 md:flex-wrap w-full md:justify-between rounded-lg border bg-card text-card-foreground shadow-sm p-4"
                  key={set.id}
                >
                  <FormField
                    control={form.control}
                    key={set.id}
                    name={`ingredientSets.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="md:flex-grow ">
                        <div className="flex space-x-2 justify-between items-baseline">
                          <FormLabel>Set Name</FormLabel>
                          <Button
                            type="button"
                            variant="destructiveOutline"
                            size="xs"
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
                    instructions: [""],
                  })
                }
              >
                <FolderPlus />
              </Button>
            </h3>
            <div className="space-y-4">
              {instructionSetsFields.fields.map((set, index) => (
                <div
                  className="flex flex-col md:flex-row md:gap-3 md:flex-wrap w-full md:justify-between rounded-lg border bg-card text-card-foreground shadow-sm p-4"
                  key={set.id}
                >
                  <FormField
                    control={form.control}
                    key={set.id}
                    name={`instructionSets.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="md:flex-grow">
                        <div className="flex space-x-2 justify-between items-baseline">
                          <FormLabel>Set Name</FormLabel>
                          <Button
                            type="button"
                            variant="destructiveOutline"
                            size="xs"
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
                    setName="instructionSets"
                    name="instructions"
                    control={form.control}
                    nestIndex={index}
                  />
                </div>
              ))}
            </div>
          </div>
          <Button variant="default" type="submit">
            Submit
          </Button>
          <InspectPayloadDialog payload={form.control._formValues} />
        </form>
      </Form>
    </div>
  );
}

type InspectPayloadDialog = {
  payload: Record<string, unknown>;
};
function InspectPayloadDialog({ payload }: InspectPayloadDialog) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Inspect payload</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Payload</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ScrollArea
            orientation="both"
            className={cn(
              "mt-2 h-[600px] w-full rounded-md border p-4 text-sm bg-slate-200/75",
              martianMono.className
            )}
          >
            <pre>{JSON.stringify(payload, null, 2)}</pre>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type NestedArrayFormFieldProps = {
  control: Control<RecipeImport>;
  nestIndex: number;
} & (
  | { name: "ingreds"; setName: "ingredientSets" }
  | { name: "instructions"; setName: "instructionSets" }
);
function NestedArrayFormField(props: NestedArrayFormFieldProps) {
  const arrFields = useFieldArray({
    // @ts-expect-error nested fields are not correctly typed
    name: `${props.setName}.${props.nestIndex}.${props.name}`,
    control: props.control,
  });

  return (
    <div className="md:flex-grow lg:m-0 ml-10 mt-2">
      {arrFields.fields.map((field, index) => (
        <FormField
          control={props.control}
          key={field.id}
          name={`${props.setName}.${props.nestIndex}.${props.name}.${index}`}
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
          arrFields.append("");
        }}
      >
        <ListPlus className="mr-2" />
        Add ingredient
      </Button>
    </div>
  );
}
